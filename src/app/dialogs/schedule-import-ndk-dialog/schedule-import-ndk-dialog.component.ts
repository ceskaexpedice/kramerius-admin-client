import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AdminApiService } from 'src/app/services/admin-api.service';

@Component({
  selector: 'app-schedule-import-ndk-dialog',
  templateUrl: './schedule-import-ndk-dialog.component.html',
  styleUrls: ['./schedule-import-ndk-dialog.component.scss']
})
export class ScheduleImportNdkDialogComponent implements OnInit {

  inProgress = false;
  importDirs = [];
  policies = ['PUBLIC', 'PRIVATE'];
  policyLabels = ['veřejné', 'neveřejné'];

  constructor(public dialogRef: MatDialogRef<ScheduleImportNdkDialogComponent>, private adminApi: AdminApiService) { }

  ngOnInit() {
    this.inProgress = true;
    this.adminApi.getConvertAndImportNdkInputDirFiles().subscribe(response => {
      this.importDirs = [];
      //TODO: neresi se prochazeni do hloubky, ale berou se jen adresare prvni urovne
      response.files.forEach(file => {
        if (file.isDir) {
          this.importDirs.push(file.name);
        }
      });
      this.inProgress = false;
    }, error => {
      console.log(error);
      this.dialogRef.close('error');
    })
  }

  schedule(formData) {
    this.adminApi.scheduleProcess({
      defid: 'convert_and_import',
      params: {
        policy: formData.policy,
        inputDataDir: formData.import_dir,
        startIndexer: formData.schedule_indexations,
      }
    }).subscribe(response => {
      this.dialogRef.close("scheduled");
    }, error => {
      console.log(error);
      this.dialogRef.close('error');
    });
  }

}
