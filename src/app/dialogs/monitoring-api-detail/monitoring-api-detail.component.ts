import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-monitoring-api-detail',
  standalone: true,
  imports: [MatDialogModule, TranslateModule, MatButtonModule, CommonModule, MatDivider],
  templateUrl: './monitoring-api-detail.component.html',
  styleUrl: './monitoring-api-detail.component.scss'
})
export class MonitoringApiDetailComponent implements OnInit{
    KEYS:string[] = ['endpoint', 'resource', 'querypart', 'httpMethod', 'startTime','endTime', 'duration', 'userId', 'labels'];

    item:any;
    snapshotArray:{ stop: number; name: string; start: number }[];

    constructor(
        public dialogRef: MatDialogRef<MonitoringApiDetailComponent>,
        @Inject(MAT_DIALOG_DATA) public data: MonitoringApiDetailComponent
      ) {
        this.item = data.item;
        if (this.item['granularSnapshot']) {
            this.snapshotArray = JSON.parse(this.item['granularSnapshot']);
        }
      }

    ngOnInit(): void {

    }
}
