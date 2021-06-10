import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { forkJoin } from 'rxjs';
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

  pids = undefined;

  pidsCounter = 0;
  scheduledCounter = 0;
  progressBarMode = 'indeterminate';

  constructor(public dialogRef: MatDialogRef<ScheduleChangePolicyByPidDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private adminApi: AdminApiService) {
    if (data) {
      this.pids = data.pids;
    }
  }

  ngOnInit() {
  }

  schedule(formData) {
    this.inProgress = true;

    const pids = this.splitPids(this.pids);
    this.pidsCounter = pids.length;
    this.scheduledCounter = 0;

    const scope = formData.scope;
    const policy = formData.policy;

    let requests = [];
    pids.forEach(pid => {
      requests.push(
        this.adminApi.scheduleProcess({
          defid: 'set_policy',
          params: {
            scope: scope,
            policy: policy,
            pid: pid,
          }
        }, () => this.scheduledCounter++)
      );
    })
    this.progressBarMode = 'determinate';

    forkJoin(requests).subscribe(result => {
      this.dialogRef.close(this.scheduledCounter);
    }, error => {
      console.log(error);
      this.dialogRef.close('error');
    });
  }

  //uuid:123 uuid:456,uuid:789;uuid:012, uuid:345; uuid:678    uuid:901
  //uuid:123 uuid:456,uuid:789;uuid:012, uuid:345; uuid:678    uuid:901 xxx
  splitPids(pids: string) {
    if (pids) {
      return pids.split(/[\s,;]+/);
    }
  }

  getProgress() {
    return Math.floor(this.scheduledCounter / this.pidsCounter * 100);
  }
}
