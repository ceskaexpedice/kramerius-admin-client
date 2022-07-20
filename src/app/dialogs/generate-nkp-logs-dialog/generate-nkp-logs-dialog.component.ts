import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { UIService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-generate-nkp-logs-dialog',
  templateUrl: './generate-nkp-logs-dialog.component.html',
  styleUrls: ['./generate-nkp-logs-dialog.component.scss']
})
export class GenerateNkpLogsDialogComponent implements OnInit {

  dateFrom:moment.Moment = moment().add(-1,"months");
  dateTo:moment.Moment = moment().add(1,"days");

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
        dateTo:  this.dateTo.format('YYYY.MM.DD')
      }
    }).subscribe(response => {
      this.dialogRef.close("scheduled");
      //this.ui.showInfoSnackBar("Proces Generování logů pro období "+this.dateFrom.format('YYYY.MM.DD')+ " - "+this.dateTo.format('YYYY.MM.DD')+" naplánován");
      this.ui.showInfoSnackBar('snackbar.success.scheduleNkpLogsProcess', {value1: this.dateFrom.format('YYYY.MM.DD'), value2: this.dateTo.format('YYYY.MM.DD')});
    }, error => {
      console.log(error);
      this.dialogRef.close('error');
    });
  }
}
