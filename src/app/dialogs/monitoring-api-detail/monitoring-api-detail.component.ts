import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-monitoring-api-detail',
  standalone: true,
  imports: [MatDialogModule, TranslateModule, MatButtonModule, CommonModule],
  templateUrl: './monitoring-api-detail.component.html',
  styleUrl: './monitoring-api-detail.component.scss'
})
export class MonitoringApiDetailComponent implements OnInit{
    KEYS:string[] = ['endpoint', 'resource', 'querypart', 'httpMethod', 'startTime','endTime', 'duration', 'userId', 'labels'];

    item:any;

    constructor(
        public dialogRef: MatDialogRef<MonitoringApiDetailComponent>,
        @Inject(MAT_DIALOG_DATA) public data: MonitoringApiDetailComponent
      ) {
        this.item = data.item;
    }

    ngOnInit(): void {

    }
}
