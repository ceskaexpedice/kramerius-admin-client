import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';
import { FlexLayoutModule } from 'ngx-flexible-layout';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { UIService } from 'src/app/services/ui.service';

@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, FlexLayoutModule, FormsModule, MatDialogModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatDatepickerModule,
   MatTooltipModule, MatCheckboxModule],
  selector: 'app-generate-nkp-logs-dialog',
  templateUrl: './generate-nkp-logs-dialog.component.html',
  styleUrls: ['./generate-nkp-logs-dialog.component.scss']
})
export class GenerateNkpLogsDialogComponent implements OnInit {

  dateFrom:moment.Moment = moment().add(-1,"months");
  dateTo:moment.Moment = moment().add(1,"days");
  emailNotification: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<GenerateNkpLogsDialogComponent>,
    private adminApi: AdminApiService,
    private ui: UIService
  ) { }

  ngOnInit(): void {
  }

  scheduleNkpLogsProcess() {
    this.adminApi.scheduleProcess({
      defid: 'nkplogs',
      params: {
        //yyyy.MM.dd
        dateFrom: this.dateFrom.format('YYYY.MM.DD'),
        dateTo:  this.dateTo.format('YYYY.MM.DD'),

        emailNotification: this.emailNotification

      }
    }).subscribe(response => {
      this.dialogRef.close("scheduled");
      this.ui.showInfoSnackBar('snackbar.success.scheduleNkpLogsProcess', {value1: this.dateFrom.format('YYYY.MM.DD'), value2: this.dateTo.format('YYYY.MM.DD')});
    }, error => {
      console.log(error);
      this.dialogRef.close('error');
    });
  }
}
