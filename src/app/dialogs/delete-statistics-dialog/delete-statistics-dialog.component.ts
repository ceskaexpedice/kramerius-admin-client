import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';

import { AdminApiService } from 'src/app/services/admin-api.service';
import { UIService } from 'src/app/services/ui.service';

@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, MatDialogModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatDatepickerModule,
   MatTooltipModule],
  selector: 'app-delete-statistics-dialog',
  templateUrl: './delete-statistics-dialog.component.html',
  styleUrls: ['./delete-statistics-dialog.component.scss']
})
export class DeleteStatisticsDialogComponent implements OnInit {

  dateFrom:moment.Moment;
  dateTo:moment.Moment

  maxDate:moment.Moment;

  constructor(
    public dialogRef: MatDialogRef<DeleteStatisticsDialogComponent>,
    private adminApi: AdminApiService,
    private ui: UIService
  ) { }


 
  ngOnInit(): void {
    this.dateFrom = moment().add(-2,"years");
    this.dateTo = moment().add(-1,"years");
  
    this.maxDate = moment().add(-1,"years");
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
