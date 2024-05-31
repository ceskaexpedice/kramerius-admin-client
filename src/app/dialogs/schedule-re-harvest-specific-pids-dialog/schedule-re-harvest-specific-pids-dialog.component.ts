import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { CdkApiService } from 'src/app/services/cdk-api.service';
import { UIService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-schedule-re-harvest-specific-pids-dialog',
  templateUrl: './schedule-re-harvest-specific-pids-dialog.component.html',
  styleUrls: ['./schedule-re-harvest-specific-pids-dialog.component.scss']
})
export class ScheduleReHarvestSpecificPidsDialogComponent implements OnInit {

  //    private adminApi: AdminApiService,
  pids;


  constructor(
    public adminApi: AdminApiService,
    public cdkApi : CdkApiService,
    private ui: UIService,
    public dialogRef: MatDialogRef<ScheduleReHarvestSpecificPidsDialogComponent>) { }

  ngOnInit(): void {
  }
  
  schedule(formData) {
    const pidlist = this.splitPids(this.pids);
    this.cdkApi.planReharvest({name:'User trigger - reharvest from admin client',pids:pidlist}).subscribe(res=> {
    });
  }
  
  /*
  onSchedule() {
    const pidlist = this.splitPids(this.pids);
    this.cdkApi.planReharvest({name:'Scheduled from admin client',pids:pidlist});
    this.dialogRef.close({ result: "scheduled" });
  }

  onCancel() {
    this.dialogRef.close({ result: "canceled" });
  }*/


  splitPids(pids: string) {
    //uuid:123 uuid:456,uuid:789;uuid:012, uuid:345; uuid:678    uuid:901
    //uuid:123 uuid:456,uuid:789;uuid:012, uuid:345; uuid:678    uuid:901 xxx
    if (pids) {
      return pids
        .split(/[\s,;]+/) //split by white spaces, ',', ';'
        .filter(n => n); //remove empty strings
    }
  }
}
