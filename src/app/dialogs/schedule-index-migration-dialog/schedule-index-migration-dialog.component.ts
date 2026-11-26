import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslateModule } from '@ngx-translate/core';
import { AdminApiService } from 'src/app/services/admin-api.service';

@Component({
  imports: [TranslateModule, FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressBarModule],
  selector: 'app-schedule-index-migration-dialog',
  templateUrl: './schedule-index-migration-dialog.component.html'
})
export class ScheduleIndexMigrationDialogComponent {
  inProgress = false;
  sourceUrl = '';
  destinationUrl = '';
  identifier = '';
  fieldList = '';
  filterQuery = '';

  constructor(
    public dialogRef: MatDialogRef<ScheduleIndexMigrationDialogComponent>,
    private adminApi: AdminApiService
  ) { }

  schedule(): void {
    this.inProgress = true;
    const params: Record<string, string> = {
      sourceUrl: this.sourceUrl.trim(),
      destinationUrl: this.destinationUrl.trim()
    };
    const optionalParams: [string, string][] = [
      ['identifier', this.identifier],
      ['fieldList', this.fieldList],
      ['filterQuery', this.filterQuery]
    ];
    optionalParams.forEach(([name, value]) => {
      if (value.trim()) params[name] = value.trim();
    });

    this.adminApi.scheduleProcess({ defid: 'copyIndex', params }).subscribe({
      next: () => this.dialogRef.close('scheduled'),
      error: error => {
        console.error(error);
        this.dialogRef.close('error');
      }
    });
  }
}
