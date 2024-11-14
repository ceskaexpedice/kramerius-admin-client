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
import { FlexLayoutModule } from 'ngx-flexible-layout';
import { AdminApiService } from 'src/app/services/admin-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, FlexLayoutModule, FormsModule, MatDialogModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, 
  MatProgressBarModule, MatTooltipModule],
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

  schedule(formData: any) {
    //console.log(formData)
    this.dialogRef.close('ignore_inconsistent_objects:' + formData.ignore_inconsistent_objects);
  }

}
