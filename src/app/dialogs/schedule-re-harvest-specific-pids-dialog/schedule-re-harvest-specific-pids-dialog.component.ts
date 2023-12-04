import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AdminApiService } from 'src/app/services/admin-api.service';

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
    public dialogRef: MatDialogRef<ScheduleReHarvestSpecificPidsDialogComponent>) { }

  ngOnInit(): void {
  }
 

  schedule(formData) {
    const pidlist = this.splitPids(this.pids);
    this.adminApi.scheduleProcess({
      defid: 'reharvest',
      params: {
        pidlist: pidlist.length == 1 ? undefined : pidlist,
        pid: pidlist.length == 1 ? pidlist[0] : undefined,
      }
    }).subscribe(response => {
      this.dialogRef.close("scheduled");
    }, error => {
      console.log(error);
      this.dialogRef.close('error');
    });
    
  }
  
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
