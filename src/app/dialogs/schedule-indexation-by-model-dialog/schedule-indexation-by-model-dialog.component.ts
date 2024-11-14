import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';

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
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDividerModule,
  MatProgressBarModule, MatTooltipModule],
  selector: 'app-schedule-indexation-by-model-dialog',
  templateUrl: './schedule-indexation-by-model-dialog.component.html',
  styleUrls: ['./schedule-indexation-by-model-dialog.component.scss']
})
export class ScheduleIndexationByModelDialogComponent implements OnInit {

  inProgress = false;
  modelName: string = undefined;
  model: string = undefined;

  constructor(public dialogRef: MatDialogRef<ScheduleIndexationByModelDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private adminApi: AdminApiService) {
    if (data) {
      this.model = data.model;
      this.modelName = data.modelName;
    }
  }

  ngOnInit() {
  }

  schedule(formData: any) {
    //console.log(formData)
    const params = {
      defid: 'new_indexer_index_model',
      params: {
        type: 'TREE_AND_FOSTER_TREES',
        pid: 'model:' + this.model,
        ignoreInconsistentObjects: formData.ignore_inconsistent_objects,
        indexNotIndexed: formData.index_not_indexed,
        indexRunningOrError: formData.index_running_or_error,
        indexIndexed: formData.index_indexed,
        indexIndexedOutdated: formData.index_indexed_outdated,
      }
    }
    this.inProgress = true;
    this.adminApi.scheduleProcess(params).subscribe(response => {
      this.dialogRef.close('scheduled');
    }, error => {
      this.dialogRef.close('error');
    });
  }

}
