import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from 'ngx-flexible-layout';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { AppSettings } from 'src/app/services/app-settings';
import { UIService } from 'src/app/services/ui.service';

@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, FlexLayoutModule, FormsModule, MatDialogModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatCardModule,
  MatProgressBarModule, MatTooltipModule],
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
      //console.log("information "+this.info);
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
