import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from 'ngx-flexible-layout';

@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, FlexLayoutModule, FormsModule, MatDialogModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
   MatTooltipModule],
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
