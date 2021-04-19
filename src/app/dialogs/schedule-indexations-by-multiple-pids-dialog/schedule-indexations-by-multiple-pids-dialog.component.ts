import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AdminApiService } from 'src/app/services/admin-api.service';

@Component({
  selector: 'app-schedule-indexations-by-multiple-pids-dialog',
  templateUrl: './schedule-indexations-by-multiple-pids-dialog.component.html',
  styleUrls: ['./schedule-indexations-by-multiple-pids-dialog.component.scss']
})
export class ScheduleIndexationsByMultiplePidsDialogComponent implements OnInit {

  inProgress = false;
  itemsCount;

  constructor(public dialogRef: MatDialogRef<ScheduleIndexationsByMultiplePidsDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private adminApi: AdminApiService) {
    if (data) {
      this.itemsCount = data;
    }
  }

  ngOnInit() { }

  schedule(formData) {
    //console.log(formData)
    this.dialogRef.close('ignore_inconsistent_objects:' + formData.ignore_inconsistent_objects);
  }

}
