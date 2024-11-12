import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
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
    MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule,
  MatProgressBarModule, MatTooltipModule],
  selector: 'app-schedule-import-foxml-dialog',
  templateUrl: './schedule-import-foxml-dialog.component.html',
  styleUrls: ['./schedule-import-foxml-dialog.component.scss']
})
export class ScheduleImportFoxmlDialogComponent implements OnInit {

  inProgress = false;
  importDirs: string[] = [];

  constructor(public dialogRef: MatDialogRef<ScheduleImportFoxmlDialogComponent>, private adminApi: AdminApiService) { }

  ngOnInit() {
    this.inProgress = true;
    this.adminApi.getImportFoxmlInputDirFiles().subscribe(response => {
      this.importDirs = [];
      //TODO: neresi se prochazeni do hloubky, ale berou se jen adresare prvni urovne
      response.files.forEach((file: any) => {
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

  schedule(formData: any) {
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
