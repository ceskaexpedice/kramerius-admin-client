import { Component, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
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

  constructor(public dialogRef: MatDialogRef<ScheduleIndexationByPidDialogComponent>, private adminApi: AdminApiService) { }

  ngOnInit() {
  }

  schedule(formData) {
    console.log(formData)
    const params = {
      defid: 'new_indexer_index_object',
      params: {
        type: formData.type,
        pid: formData.pid,
        title: undefined,
        ignoreInconsistentObjects: formData.ignore_inconsistent_objects
      }
    }
    this.inProgress = true;
    this.adminApi.scheduleProcess(params).subscribe(response => {
      this.dialogRef.close('scheduled');
    }, error => {
      this.dialogRef.close('error');
    });
  }

}
