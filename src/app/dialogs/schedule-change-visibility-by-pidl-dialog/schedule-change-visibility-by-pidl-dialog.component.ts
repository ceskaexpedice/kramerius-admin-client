import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AdminApiService } from 'src/app/services/admin-api.service';

@Component({
  selector: 'app-schedule-change-visibility-by-pidl-dialog',
  templateUrl: './schedule-change-visibility-by-pidl-dialog.component.html',
  styleUrls: ['./schedule-change-visibility-by-pidl-dialog.component.scss']
})
export class ScheduleChangeVisibilityByPidlDialogComponent implements OnInit {

  scopeKeys = ['object', 'tree',];
  scopeNames = ['Jen objekt', 'Objekt i s potomky',];

  visibilityKeys = ['public', 'private',];
  visibilityNames = ['Veřejné', 'Neveřejné',];

  selectedVisibility = this.visibilityKeys[0];

  selectedScope = this.scopeKeys[0];
  inProgress = false;

  pid = undefined;

  constructor(public dialogRef: MatDialogRef<ScheduleChangeVisibilityByPidlDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private adminApi: AdminApiService) {
    if (data) {
      this.pid = data.pid;
    }
  }

  ngOnInit() {
  }

  schedule(formData) {
    console.log(formData)
    console.log("TODO: actually schedule Proc3ss")
    this.dialogRef.close('scheduled');

    // const params = {
    //   defid: 'new_indexer_index_object',
    //   params: {
    //     type: formData.type,
    //     pid: this.pid,
    //     title: this.title,
    //     ignoreInconsistentObjects: formData.ignore_inconsistent_objects
    //   }
    // }
    // this.inProgress = true;
    // //console.log(params);
    // this.adminApi.scheduleProcess(params).subscribe(response => {
    //   this.dialogRef.close('scheduled');
    // }, error => {
    //   this.dialogRef.close('error');
    // });
  }

}
