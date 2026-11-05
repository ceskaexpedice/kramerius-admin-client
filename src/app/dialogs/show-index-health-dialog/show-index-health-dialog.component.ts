import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslateModule } from '@ngx-translate/core';
import { CdkApiService } from 'src/app/services/cdk-api.service';

interface CountValue { value: string; count: number; }
interface ComparisonRow { name: string; cdk: number | null; remote: number | null; difference: number | null; }

@Component({
  selector: 'app-show-index-health-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatProgressBarModule, TranslateModule],
  templateUrl: './show-index-health-dialog.component.html',
  styleUrls: ['./show-index-health-dialog.component.scss']
})
export class ShowIndexHealthDialogComponent implements OnInit {
  loading = true;
  error = false;
  health: any;
  modelRows: ComparisonRow[] = [];
  globalLicenseRows: ComparisonRow[] = [];
  localLicenseRows: ComparisonRow[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { code: string }, private cdkApi: CdkApiService) {}

  ngOnInit(): void {
    this.cdkApi.indexHealth(this.data.code).subscribe({
      next: response => {
        this.health = response;
        this.modelRows = this.compare(response?.cdk?.models, response?.remote?.models);
        this.globalLicenseRows = this.compare(
          this.licenses(response?.cdk?.licenses, false), this.licenses(response?.remote?.licenses, false));
        this.localLicenseRows = this.compare(
          this.licenses(response?.cdk?.licenses, true), this.licenses(response?.remote?.licenses, true));
        this.loading = false;
      },
      error: () => { this.loading = false; this.error = true; }
    });
  }

  private licenses(values: CountValue[] | undefined, local: boolean): CountValue[] {
    const prefix = `${this.data.code}_`;
    return (values || []).filter(item => local
      ? item.value.startsWith(prefix)
      : !item.value.includes('_'))
      .map(item => ({ ...item, value: local ? item.value.slice(prefix.length) : item.value }));
  }

  private compare(cdk: CountValue[] | undefined, remote: CountValue[] | undefined): ComparisonRow[] {
    const cdkCounts = new Map((cdk || []).map(item => [item.value, item.count]));
    const remoteCounts = new Map((remote || []).map(item => [item.value, item.count]));
    return [...new Set([...cdkCounts.keys(), ...remoteCounts.keys()])].sort((a, b) => a.localeCompare(b)).map(name => {
      const cdkCount = cdkCounts.get(name);
      const remoteCount = remoteCounts.get(name);
      return {
        name,
        cdk: cdkCount ?? null,
        remote: remoteCount ?? null,
        difference: cdkCount == null || remoteCount == null ? null : remoteCount - cdkCount
      };
    });
  }

  hasDifferences(rows: ComparisonRow[]): boolean {
    return rows.some(row => row.difference !== 0);
  }
}
