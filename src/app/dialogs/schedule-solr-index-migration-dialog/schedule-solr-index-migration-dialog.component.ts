import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { TranslateModule } from '@ngx-translate/core';
import { AdminApiService } from 'src/app/services/admin-api.service';

type CoreName = 'logs' | 'processing' | 'search';
interface CoreConfiguration {
  identifierField: string;
  usesCompositeId: boolean;
  url: string;
  health?: { status?: string; exists?: boolean; reachable?: boolean; identifierMatchesSchema?: boolean };
}

@Component({
  imports: [TranslateModule, FormsModule, MatDialogModule, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatProgressBarModule, MatSelectModule, MatSliderModule],
  selector: 'app-schedule-solr-index-migration-dialog',
  templateUrl: './schedule-solr-index-migration-dialog.component.html'
})
export class ScheduleSolrIndexMigrationDialogComponent implements OnInit {
  readonly coreNames: CoreName[] = ['logs', 'processing', 'search'];
  readonly processIds: Record<CoreName, string> = {
    logs: 'solr-logs-index-copy',
    processing: 'solr-processing-index-copy',
    search: 'solr-search-index-copy'
  };
  selectedCore: CoreName = 'search';
  batchSize = 10;
  verifyAfterCopy = false;
  destinationUrl = '';
  cores: Partial<Record<CoreName, CoreConfiguration>> = {};
  loading = true;
  loadError = false;
  inProgress = false;

  get batchSizeMax(): number {
    return this.cores[this.selectedCore]?.usesCompositeId ? 50 : 100;
  }

  constructor(public dialogRef: MatDialogRef<ScheduleSolrIndexMigrationDialogComponent>, private adminApi: AdminApiService) { }

  ngOnInit(): void {
    this.adminApi.getCoreConfiguration().subscribe({
      next: response => {
        this.cores = response?.cores ?? {};
        this.setDefaultBatchSize();
        this.loading = false;
      },
      error: error => {
        console.error(error);
        this.loading = false;
        this.loadError = true;
      }
    });
  }

  onCoreChange(): void {
    this.setDefaultBatchSize();
  }

  private setDefaultBatchSize(): void {
    this.batchSize = Math.round(this.batchSizeMax * 0.75);
  }

  schedule(): void {
    this.inProgress = true;
    this.adminApi.scheduleProcess({
      defid: this.processIds[this.selectedCore],
      params: {
        destinationUrl: this.destinationUrl.trim(),
        batchSize: this.batchSize,
        verifyAfterCopy: this.verifyAfterCopy
      }
    }).subscribe({
      next: () => this.dialogRef.close('scheduled'),
      error: error => {
        console.error(error);
        this.dialogRef.close('error');
      }
    });
  }
}
