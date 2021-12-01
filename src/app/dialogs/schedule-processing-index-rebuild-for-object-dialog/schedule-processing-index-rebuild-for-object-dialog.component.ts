import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { AdminApiService } from 'src/app/services/admin-api.service';


@Component({
  selector: 'app-schedule-processing-index-rebuild-for-object-dialog',
  templateUrl: './schedule-processing-index-rebuild-for-object-dialog.component.html',
  styleUrls: ['./schedule-processing-index-rebuild-for-object-dialog.component.scss']
})
export class ScheduleProcessingIndexRebuildForObjectDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ScheduleProcessingIndexRebuildForObjectDialogComponent>, private adminApi: AdminApiService) { }

  inProgress = false;
  pid;

  ngOnInit() {
  }

  schedule() {
    this.inProgress = true;
    this.adminApi.scheduleProcess({
      defid: 'processing_rebuild_for_object',
      params: {
        pid: this.pid,
      }
    }).subscribe(response => {
      this.dialogRef.close('scheduled');
    }, error => {
      console.log(error);
      this.dialogRef.close('error');
    });
  }

  pidValid(pid) {
    if (!!pid) {
      return pid.startsWith('uuid:') && pid.length > 'uuid:'.length;
    }
  }

}
