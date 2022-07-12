import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { UIService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-nkp-logy',
  templateUrl: './nkp-logy.component.html',
  styleUrls: ['./nkp-logy.component.scss']
})
export class NkpLogyComponent implements OnInit {

  dateFrom:moment.Moment = moment().add(-1,"months");
  dateTo:moment.Moment = moment().add(1,"days");

  constructor(
    public dialogRef: MatDialogRef<NkpLogyComponent>,
    private adminApi: AdminApiService,
    private ui: UIService
  ) { }

  ngOnInit(): void {
  }

  scheduleProcess() {
    this.adminApi.scheduleProcess({
      defid: 'nkplogs',
      params: {
        //yyyy.MM.dd
        dateFrom: this.dateFrom.format('YYYY.MM.DD'),
        dateTo:  this.dateTo.format('YYYY.MM.DD')
      }
    }).subscribe(response => {
      this.dialogRef.close("scheduled");
      this.ui.showInfoSnackBar("Proces Generování logů pro období "+this.dateFrom.format('YYYY.MM.DD')+ " - "+this.dateTo.format('YYYY.MM.DD')+" naplánován");
    }, error => {
      console.log(error);
      this.dialogRef.close('error');
    });
  }
}
