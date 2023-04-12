import { Component, OnInit } from '@angular/core';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { UIService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-schedule-start-the-sdnnt-review-process',
  templateUrl: './schedule-start-the-sdnnt-review-process.component.html',
  styleUrls: ['./schedule-start-the-sdnnt-review-process.component.scss']
})
export class ScheduleStartTheSdnntReviewProcessComponent implements OnInit {

  constructor(
    private ui: UIService,
    private adminApi: AdminApiService,
  ) { }

  ngOnInit(): void {
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
