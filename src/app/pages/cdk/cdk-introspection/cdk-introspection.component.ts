import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Clipboard } from '@angular/cdk/clipboard';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CdkApiService } from 'src/app/services/cdk-api.service';

interface LibraryHit { library: string; model: string; rootPid: string; pid: string; pidPaths: string[]; client: string; cdk: boolean; }

@Component({
  selector: 'app-cdk-introspection',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, FormsModule, MatFormFieldModule, MatInputModule, MatProgressBarModule, MatIconModule, MatTooltipModule],
  templateUrl: './cdk-introspection.component.html',
  styleUrls: ['./cdk-introspection.component.scss']
})
export class CdkIntrospectionComponent implements OnInit {
  pids: string;
  pidList: string[] = [];
  hitsByPid: Record<string, LibraryHit[]> = {};
  logos: Record<string, string> = {};
  loading = false;

  constructor(@Inject(MAT_DIALOG_DATA) data: { pids?: string }, private cdkApi: CdkApiService, private clipboard: Clipboard) {
    this.pids = data?.pids || '';
  }

  get dialogTitle(): string {
    return this.pidList.length ? `Introspekce PID: ${this.pidList.join(', ')}` : 'Introspekce PID';
  }

  ngOnInit(): void {
    this.cdkApi.registrinfo().pipe(catchError(() => of([]))).subscribe((libraries: any[]) => {
      this.logos = Object.fromEntries((Array.isArray(libraries) ? libraries : [])
        .filter(library => library?.code && library?.logo)
        .map(library => [library.code, library.logo]));
    });
    this.load();
  }

  onPidsChange(): void {
    this.load();
  }

  hasConflict(hits: LibraryHit[]): boolean {
    return new Set(hits.map(hit => hit.model).filter(Boolean)).size > 1;
  }

  hasCdkConflict(hits: LibraryHit[]): boolean {
    return hits.filter(hit => hit.cdk).length > 1;
  }

  logo(library: string): string | undefined {
    return this.logos[library];
  }

  clientUrl(client: string, pid: string): string {
    return `${client.replace(/\/+$/, '')}/uuid/${pid}`;
  }

  pathSegments(path: string): string[] {
    return (path || '').split('/').filter(Boolean);
  }

  pathDiffers(pid: string, pathIndex: number, path: string): boolean {
    if (pathIndex !== 0) return false;
    const values = (this.hitsByPid[pid] || []).map(hit => hit.pidPaths[0] ?? null);
    return this.valueDiffers(values, path);
  }

  fieldDiffers(pid: string, field: 'rootPid' | 'model', value: string): boolean {
    return this.valueDiffers((this.hitsByPid[pid] || []).map(hit => hit[field] || null), value || null);
  }

  private valueDiffers(values: Array<string | null>, value: string | null): boolean {
    const counts = new Map<string | null, number>();
    values.forEach(item => counts.set(item, (counts.get(item) || 0) + 1));
    if (counts.size < 2) return false;

    const ordered = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    if (ordered.length > 1 && ordered[0][1] > ordered[1][1]) {
      return value !== ordered[0][0];
    }
    return true;
  }

  copy(value: string): void {
    if (value) this.clipboard.copy(value);
  }

  inspectPid(pid: string): void {
    this.pids = pid;
    this.load();
  }

  private load(): void {
    this.pidList = [...new Set((this.pids || '').split(/[\s,;]+/).filter(Boolean))];
    this.hitsByPid = {};
    if (!this.pidList.length) {
      this.loading = false;
      return;
    }

    this.loading = true;
    forkJoin(this.pidList.map(pid => this.cdkApi.introspectPid(pid).pipe(catchError(() => of({}))))).subscribe(results => {
      const found: Record<string, LibraryHit[]> = {};
      results.forEach((response: any, index) => {
        const rows: LibraryHit[] = [];
        Object.entries(response || {}).forEach(([library, value]: [string, any]) => {
          const docs = value?.response?.docs || [];
          docs.forEach((doc: any) => rows.push({
            library,
            model: doc.model || '',
            rootPid: doc['root.pid'] || '',
            pid: doc.pid || this.pidList[index],
            pidPaths: Array.isArray(doc.pid_paths) ? doc.pid_paths : (doc.pid_paths ? [doc.pid_paths] : []),
            client: value?.client || '',
            cdk: library === '_cdk_'
          }));
        });
        found[this.pidList[index]] = rows;
      });
      this.hitsByPid = found;
      this.loading = false;
    });
  }
}
