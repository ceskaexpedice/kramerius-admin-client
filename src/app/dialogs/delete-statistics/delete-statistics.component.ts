import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { UIService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-delete-statistics',
  templateUrl: './delete-statistics.component.html',
  styleUrls: ['./delete-statistics.component.scss']
})
export class DeleteStatisticsComponent implements OnInit {

  dateFrom:moment.Moment = moment().add(-2,"years");
  dateTo:moment.Moment = moment().add(-1,"years");

  maxDate:moment.Moment = moment().add(-1,"years");

  constructor(
    public dialogRef: MatDialogRef<DeleteStatisticsComponent>,
    private adminApi: AdminApiService,
    private ui: UIService
  ) { }


 
  ngOnInit(): void {
  }
  
  delete() {
    this.adminApi.deleteStatistics(this.dateFrom.format('YYYY.MM.DD'), this.dateTo.format('YYYY.MM.DD'))
    .subscribe(response => {
      this.dialogRef.close("scheduled");
      this.ui.showInfoSnackBar("Statistiky pro období "+this.dateFrom.format('YYYY.MM.DD')+" do "+this.dateTo.format('YYYY.MM.DD')+" smazány");
    }, error => {
      console.log(error);
      this.dialogRef.close('error');
    })
  }
}
