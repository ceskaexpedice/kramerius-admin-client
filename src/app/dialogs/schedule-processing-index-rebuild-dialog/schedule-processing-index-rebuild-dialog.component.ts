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
import { AdminApiService } from 'src/app/services/admin-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, FlexLayoutModule, FormsModule, MatDialogModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
  MatProgressBarModule, MatTooltipModule],
  selector: 'app-schedule-processing-index-rebuild-dialog',
  templateUrl: './schedule-processing-index-rebuild-dialog.component.html',
  styleUrls: ['./schedule-processing-index-rebuild-dialog.component.scss']
})
export class ScheduleProcessingIndexRebuildDialogComponent implements OnInit {

  inProgress = false;

  constructor(public dialogRef: MatDialogRef<ScheduleProcessingIndexRebuildDialogComponent>, private adminApi: AdminApiService) { }

  ngOnInit() {
  }

  schedule() {
    this.inProgress = true;
    this.adminApi.scheduleProcess({
      defid: 'processing_rebuild',
      params: {}
    }).subscribe(response => {
      this.dialogRef.close('scheduled');
    }, error => {
      console.log(error);
      this.dialogRef.close('error');
    });
  }

}
