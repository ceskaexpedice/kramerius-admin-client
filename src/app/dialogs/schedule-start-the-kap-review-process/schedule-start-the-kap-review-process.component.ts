import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { AppSettings } from 'src/app/services/app-settings';
import { UIService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-schedule-start-the-kap-review-process',
  imports: [
    MatDialogModule, MatCardModule, MatIconModule, TranslateModule, MatButtonModule
  ],
  templateUrl: './schedule-start-the-kap-review-process.component.html',
  styleUrl: './schedule-start-the-kap-review-process.component.scss',
})
export class ScheduleStartTheKapReviewProcessComponent implements OnInit {
  info:any ={};

  constructor(
    public appSettings: AppSettings,
    private api: AdminApiService,
    private ui: UIService,
    private adminApi: AdminApiService,
  ) {
  }

  ngOnInit(): void {
    this.api.getKappSyncInfo().subscribe((data:any)=> {
      this.info = data;
    });
  }

  startsyncProcess() {
    this.adminApi.scheduleProcess({
      defid: 'kapp-sync',
      params: {
      }
    }).subscribe(response => {
      this.ui.showInfoSnackBar('snackbar.success.scheduleStartTheKapReviewProcess');
    }, error => {
      this.ui.showInfoSnackBar('snackbar.error.scheduleStartTheKapReviewProcess');
      console.log(error);
    });
  }
}
