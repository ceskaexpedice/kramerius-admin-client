import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AdminApiService } from 'src/app/services/admin-api.service';

@Component({
  selector: 'app-schedule-import-foxml-dialog',
  templateUrl: './schedule-import-foxml-dialog.component.html',
  styleUrls: ['./schedule-import-foxml-dialog.component.scss']
})
export class ScheduleImportFoxmlDialogComponent implements OnInit {

  inProgress = false;
  importDirs = [];

  constructor(public dialogRef: MatDialogRef<ScheduleImportFoxmlDialogComponent>, private adminApi: AdminApiService) { }

  ngOnInit() {
    this.inProgress = true;
    this.adminApi.getImportFoxmlInputDirFiles().subscribe(response => {
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
      defid: 'import',
      params: {
        inputDataDir: formData.import_dir,
        startIndexer: formData.schedule_indexations,
        license: formData.license
      }
    }).subscribe(response => {
      //console.log(response);
      this.dialogRef.close("scheduled");
    }, error => {
      console.log(error);
      this.dialogRef.close('error');
    });
  }

}
