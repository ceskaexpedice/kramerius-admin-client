import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AdminApiService } from 'src/app/services/admin-api.service';

@Component({
  selector: 'app-schedule-change-policy-by-pid-dialog',
  templateUrl: './schedule-change-policy-by-pid-dialog.component.html',
  styleUrls: ['./schedule-change-policy-by-pid-dialog.component.scss']
})
export class ScheduleChangePolicyByPidDialogComponent implements OnInit {

  scopeKeys = ['TREE', 'OBJECT',];
  scopeNames = ['Objekt i s potomky', 'Jen objekt'];

  policyKeys = ['PUBLIC', 'PRIVATE',];
  policyNames = ['Veřejné', 'Neveřejné',];

  selectedPolicy = this.policyKeys[0];

  selectedScope = this.scopeKeys[0];
  inProgress = false;

  pid = undefined;

  constructor(public dialogRef: MatDialogRef<ScheduleChangePolicyByPidDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private adminApi: AdminApiService) {
    if (data) {
      this.pid = data.pid;
    }
  }

  ngOnInit() {
  }

  schedule(formData) {
    console.log(formData)
    const params = {
      defid: 'set_policy',
      params: {
        scope: formData.scope,
        policy: formData.policy,
        pid: this.pid,
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
