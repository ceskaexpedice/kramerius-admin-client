import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { AdminApiService } from 'src/app/services/admin-api.service';

@Component({
  selector: 'app-schedule-processing-index-rebuild-dialog',
  templateUrl: './schedule-processing-index-rebuild-dialog.component.html',
  styleUrls: ['./schedule-processing-index-rebuild-dialog.component.scss']
})
export class ScheduleProcessingIndexRebuildDialogComponent implements OnInit {

  inProgress = false;

  constructor(public dialogRef: MatDialogRef<ScheduleProcessingIndexRebuildDialogComponent>, private adminApi: AdminApiService) { }

  ngOnInit() {
  }

  schedule() {
    this.inProgress = true;
    this.adminApi.scheduleProcess({
      defid: 'processing_rebuild',
      params: {}
    }).subscribe(response => {
      this.dialogRef.close('scheduled');
    }, error => {
      console.log(error);
      this.dialogRef.close('error');
    });
  }

}
