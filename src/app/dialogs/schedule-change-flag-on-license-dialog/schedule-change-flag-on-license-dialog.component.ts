import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { UIService } from 'src/app/services/ui.service';
import { ClientApiService } from 'src/app/services/client-api.service';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-schedule-change-flag-on-license-dialog',
  templateUrl: './schedule-change-flag-on-license-dialog.component.html',
  styleUrls: ['./schedule-change-flag-on-license-dialog.component.scss']
})
export class ScheduleChangeFlagOnLicenseDialogComponent implements OnInit {


  models = [];
  removeFlag = false;

  constructor(
    public dialogRef: MatDialogRef<ScheduleChangeFlagOnLicenseDialogComponent>, 
    private adminApi: AdminApiService,
    private ui: UIService, 
    private clientApi:ClientApiService) { 

  }

  ngOnInit(): void {

    this.adminApi.getConfFlagToLicense().subscribe(res=> {
      this.models = res['processess.flag_to_license.models'];
    });

  }



  changeFlagOnLicense() {
    this.adminApi.scheduleProcess({
      defid: 'flag_to_license',
      params: {
        'remove_policy':''+this.removeFlag
      }
    }).subscribe(response => {
      this.dialogRef.close("scheduled");
      this.ui.showInfoSnackBar('snackbar.success.changeFlagToLicense');
    }, error => {
      console.log(error);
      this.dialogRef.close('error');
    });
  }
}
