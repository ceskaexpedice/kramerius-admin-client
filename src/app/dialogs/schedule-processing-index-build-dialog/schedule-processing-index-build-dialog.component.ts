import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslateModule } from '@ngx-translate/core';
import { AdminApiService } from 'src/app/services/admin-api.service';

@Component({
  imports: [TranslateModule, FormsModule, MatDialogModule, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatProgressBarModule],
  selector: 'app-schedule-processing-index-build-dialog',
  templateUrl: './schedule-processing-index-build-dialog.component.html'
})
export class ScheduleProcessingIndexBuildDialogComponent {
  inProgress = false;
  destinationUrl = '';
  ignoreInconsistentObjects = false;
  topModels = '';

  constructor(
    public dialogRef: MatDialogRef<ScheduleProcessingIndexBuildDialogComponent>,
    private adminApi: AdminApiService
  ) { }

  schedule(): void {
    this.inProgress = true;
    const params: Record<string, string | number | boolean> = {
      destinationUrl: this.destinationUrl.trim(),
      ignoreInconsistentObjects: this.ignoreInconsistentObjects
    };
    if (this.topModels.trim()) params['topModels'] = this.topModels.trim();

    this.adminApi.scheduleProcess({ defid: 'search-index-processing', params }).subscribe({
      next: () => this.dialogRef.close('scheduled'),
      error: error => {
        console.error(error);
        this.dialogRef.close('error');
      }
    });
  }
}
