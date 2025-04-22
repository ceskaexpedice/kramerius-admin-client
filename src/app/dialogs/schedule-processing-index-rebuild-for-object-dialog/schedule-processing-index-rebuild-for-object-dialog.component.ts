import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { AdminApiService } from 'src/app/services/admin-api.service';


@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, MatDialogModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
  MatProgressBarModule, MatTooltipModule],
  selector: 'app-schedule-processing-index-rebuild-for-object-dialog',
  templateUrl: './schedule-processing-index-rebuild-for-object-dialog.component.html',
  styleUrls: ['./schedule-processing-index-rebuild-for-object-dialog.component.scss']
})
export class ScheduleProcessingIndexRebuildForObjectDialogComponent implements OnInit {

  fixed = false;
  inProgress = false;
  pid;
  title;


  constructor(public dialogRef: MatDialogRef<ScheduleProcessingIndexRebuildForObjectDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private adminApi: AdminApiService) {
    if (data) {
      this.fixed = true;
      this.pid = data.pid;
      this.title = data.title;
    }
  }

  ngOnInit() {
  }

  schedule() {
    this.inProgress = true;
    this.adminApi.scheduleProcess({
      defid: 'processing_rebuild_for_object',
      params: {
        pid: this.pid,
      }
    }).subscribe(response => {
      this.dialogRef.close('scheduled');
    }, error => {
      console.log(error);
      this.dialogRef.close('error');
    });
  }

  pidValid(pid: string) {
    if (!!pid) {
      return pid.startsWith('uuid:') && pid.length > 'uuid:'.length;
    }
    return false;
  }

}
