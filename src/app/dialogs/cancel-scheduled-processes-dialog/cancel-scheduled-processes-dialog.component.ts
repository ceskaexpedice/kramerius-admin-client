import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from 'ngx-flexible-layout';
import { forkJoin } from 'rxjs';
import { Batch } from 'src/app/models/batch.model';
import { AdminApiService, ProcessesParams } from 'src/app/services/admin-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, FlexLayoutModule, FormsModule, MatDialogModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatCardModule,
    MatProgressBarModule, MatTooltipModule],
  selector: 'app-cancel-scheduled-processes-dialog',
  templateUrl: './cancel-scheduled-processes-dialog.component.html',
  styleUrls: ['./cancel-scheduled-processes-dialog.component.scss']
})
export class CancelScheduledProcessesDialogComponent implements OnInit {

  batch_params;
  batches: Batch[] = [];
  //stav
  fetchingBatches = false;
  cancelingBatches = false;
  //chyby
  fetchingErrorMsg = false;

  constructor(public dialogRef: MatDialogRef<CancelScheduledProcessesDialogComponent>, @Inject(MAT_DIALOG_DATA) batch_params: ProcessesParams, private adminApi: AdminApiService) {
    batch_params.state = 'PLANNED';
    this.batch_params = batch_params;
    this.fetchingBatches = true;
    this.adminApi.getProcesses(batch_params).subscribe(([batches, total]: [Batch[], number]) => {
      this.batches = batches;
      this.fetchingBatches = false;
    }, errorResponse => {
      this.fetchingErrorMsg = errorResponse.error.message;
      this.fetchingBatches = false;
    });
  }

  ngOnInit(): void { }

  onClose() {
    this.dialogRef.close({ state: 'closed' });
  }

  isSomethingToCancel() {
    return this.batches.length != 0;
  }

  onCancelAll() {
    let batches_to_cancel = [];
    this.cancelingBatches = true;
    //znovu se ptam backendu na procesy a filtruju podle stavu, protoze zatimco byl dialog otevreny, mohly se stavy zmenit. 
    //A nechci zabijet proces co skoncil (nestane se nic), ale hlavne proces, co bezi
    this.adminApi.getProcesses(this.batch_params).subscribe(([batches, total]: [Batch[], number]) => {
      batches_to_cancel = batches;
      this.cancelAllAndClose(batches);
    });
  }

  cancelAllAndClose(batches: Batch[]) {
    let requests: any[] = [];
    batches.forEach(batch => {
      requests.push(this.adminApi.killBatch(batch.id));
    });

    forkJoin(requests).subscribe(result => {
      this.cancelingBatches = false;
      this.dialogRef.close({ state: 'killed', kills: requests.length });
    }, error => {
      this.dialogRef.close();
    });
  }

}
