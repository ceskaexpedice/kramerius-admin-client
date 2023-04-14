import { Component, OnInit } from '@angular/core';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { AppSettings } from 'src/app/services/app-settings';
import { UIService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-schedule-start-the-sdnnt-review-process',
  templateUrl: './schedule-start-the-sdnnt-review-process.component.html',
  styleUrls: ['./schedule-start-the-sdnnt-review-process.component.scss']
})
export class ScheduleStartTheSdnntReviewProcessComponent implements OnInit {

  info:any ={};

  constructor(
    public appSettings: AppSettings,
    private api: AdminApiService,
    private ui: UIService,
    private adminApi: AdminApiService,
  ) { 


  }

  ngOnInit(): void {
    this.api.getSdntSyncInfo().subscribe((data:any)=> {
      this.info = data;
      console.log("information "+this.info);
    });
  }


  startsyncProcess() {
    this.adminApi.scheduleProcess({
      defid: 'sdnnt-sync',
      params: {
      }
    }).subscribe(response => {
      this.ui.showInfoSnackBar('snackbar.success.scheduleStartTheSdnntReviewProcess');
    }, error => {
      this.ui.showInfoSnackBar('snackbar.error.scheduleStartTheSdnntReviewProcess');
      console.log(error);
    });
  }

}
