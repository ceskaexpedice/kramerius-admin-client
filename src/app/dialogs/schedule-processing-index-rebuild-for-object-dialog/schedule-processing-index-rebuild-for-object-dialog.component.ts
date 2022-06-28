import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdminApiService } from 'src/app/services/admin-api.service';


@Component({
  selector: 'app-schedule-processing-index-rebuild-for-object-dialog',
  templateUrl: './schedule-processing-index-rebuild-for-object-dialog.component.html',
  styleUrls: ['./schedule-processing-index-rebuild-for-object-dialog.component.scss']
})
export class ScheduleProcessingIndexRebuildForObjectDialogComponent implements OnInit {

  fixed = false;
  inProgress = false;
  pid;
  title;


  constructor(public dialogRef: MatDialogRef<ScheduleProcessingIndexRebuildForObjectDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private adminApi: AdminApiService) {
    if (data) {
      this.fixed = true;
      this.pid = data.pid;
      this.title = data.title;
    }
  }

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
