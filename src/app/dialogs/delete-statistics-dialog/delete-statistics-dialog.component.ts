import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { UIService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-delete-statistics-dialog',
  templateUrl: './delete-statistics-dialog.component.html',
  styleUrls: ['./delete-statistics-dialog.component.scss']
})
export class DeleteStatisticsDialogComponent implements OnInit {

  dateFrom:moment.Moment = moment().add(-2,"years");
  dateTo:moment.Moment = moment().add(-1,"years");

  maxDate:moment.Moment = moment().add(-1,"years");

  constructor(
    public dialogRef: MatDialogRef<DeleteStatisticsDialogComponent>,
    private adminApi: AdminApiService,
    private ui: UIService
  ) { }


 
  ngOnInit(): void {
  }
  
  deleteStatistics() {
    this.adminApi.deleteStatistics(this.dateFrom.format('YYYY.MM.DD'), this.dateTo.format('YYYY.MM.DD'))
    .subscribe(response => {
      this.dialogRef.close("scheduled");
      this.ui.showInfoSnackBar('snackbar.success.deleteStatistics', {value1: this.dateFrom.format('YYYY.MM.DD'), value2: this.dateTo.format('YYYY.MM.DD')});
    }, error => {
      console.log(error);
      this.dialogRef.close('error');
    })
  }
}
