import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdminApiService } from 'src/app/services/admin-api.service';

@Component({
  selector: 'app-schedule-indexation-by-model-dialog',
  templateUrl: './schedule-indexation-by-model-dialog.component.html',
  styleUrls: ['./schedule-indexation-by-model-dialog.component.scss']
})
export class ScheduleIndexationByModelDialogComponent implements OnInit {

  inProgress = false;
  modelName = undefined;
  model = undefined;

  constructor(public dialogRef: MatDialogRef<ScheduleIndexationByModelDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private adminApi: AdminApiService) {
    if (data) {
      this.model = data.model;
      this.modelName = data.modelName;
    }
  }

  ngOnInit() {
  }

  schedule(formData) {
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
