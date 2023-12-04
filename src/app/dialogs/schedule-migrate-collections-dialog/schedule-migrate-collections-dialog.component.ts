import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-schedule-migrate-collections-dialog',
  templateUrl: './schedule-migrate-collections-dialog.component.html',
  styleUrls: ['./schedule-migrate-collections-dialog.component.scss']
})
export class ScheduleMigrateCollectionsDialogComponent implements OnInit {

  k5instance="";

  constructor(public dialogRef: MatDialogRef<ScheduleMigrateCollectionsDialogComponent>) { }

  ngOnInit(): void {
  }

  migrate() {
    this.dialogRef.close({ k5: this.k5instance });
  }

}
