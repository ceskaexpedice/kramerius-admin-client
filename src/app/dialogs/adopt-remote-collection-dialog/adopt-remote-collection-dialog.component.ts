import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-adopt-remote-collection-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, TranslateModule],
  template: `
    <h2 mat-dialog-title>{{ 'button.adoptRemoteCollection' | translate }}</h2>
    <mat-dialog-content>
      <p>{{ 'desc.adoptRemoteCollection' | translate:{ title: collectionTitle, library: library } }}</p>
      <mat-form-field appearance="outline" class="app-w-100">
        <mat-label>{{ 'desc.name' | translate }}</mat-label>
        <input matInput [(ngModel)]="title" [placeholder]="collectionTitle" required cdkFocusInitial />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ 'button.cancel' | translate }}</button>
      <button mat-flat-button color="primary" [disabled]="!canSubmit" (click)="submit()">
        {{ 'button.create' | translate }}
      </button>
    </mat-dialog-actions>
  `
})
export class AdoptRemoteCollectionDialogComponent {
  title: string;
  collectionTitle: string;
  library: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { title: unknown; library: unknown },
    public dialogRef: MatDialogRef<AdoptRemoteCollectionDialogComponent>
  ) {
    this.collectionTitle = this.toText(data?.title);
    this.library = this.toText(data?.library);
    this.title = this.collectionTitle;
  }

  get canSubmit(): boolean {
    return this.title.trim().length > 0;
  }

  submit(): void {
    if (this.canSubmit) {
      this.dialogRef.close(this.title.trim());
    }
  }

  private toText(value: unknown): string {
    if (Array.isArray(value)) {
      for (const item of value) {
        const text = this.toText(item);
        if (text) return text;
      }
      return '';
    }
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (value && typeof value === 'object') {
      const fields = value as Record<string, unknown>;
      for (const key of ['value', 'title', 'name', 'label']) {
        if (typeof fields[key] === 'string') return fields[key] as string;
      }
    }
    return '';
  }
}
