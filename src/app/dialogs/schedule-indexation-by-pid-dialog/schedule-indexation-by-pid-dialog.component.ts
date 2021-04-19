import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AdminApiService } from 'src/app/services/admin-api.service';

@Component({
  selector: 'app-schedule-indexation-by-pid-dialog',
  templateUrl: './schedule-indexation-by-pid-dialog.component.html',
  styleUrls: ['./schedule-indexation-by-pid-dialog.component.scss']
})
export class ScheduleIndexationByPidDialogComponent implements OnInit {

  indexationProcessTypes = ['TREE_AND_FOSTER_TREES', 'OBJECT'];
  indexationProcessTypeNames = ['Úplná', 'Jen objekt'];

  selectedIndexationProcessType = this.indexationProcessTypes[0];
  inProgress = false;

  pid = undefined;
  title = undefined;

  constructor(public dialogRef: MatDialogRef<ScheduleIndexationByPidDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private adminApi: AdminApiService) {
    if (data) {
      this.pid = data.pid;
      this.title = data.title;
    }
  }

  ngOnInit() {
  }

  schedule(formData) {
    //console.log(formData)
    const params = {
      defid: 'new_indexer_index_object',
      params: {
        type: formData.type,
        pid: this.pid,
        title: this.title,
        ignoreInconsistentObjects: formData.ignore_inconsistent_objects
      }
    }
    this.inProgress = true;
    //console.log(params);
    this.adminApi.scheduleProcess(params).subscribe(response => {
      this.dialogRef.close('scheduled');
    }, error => {
      this.dialogRef.close('error');
    });
  }

}
