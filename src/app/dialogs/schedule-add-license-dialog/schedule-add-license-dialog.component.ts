import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule, ProgressBarMode } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { License } from 'src/app/models/license.model';
import { AdminApiService } from 'src/app/services/admin-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, MatDialogModule,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatProgressBarModule, 
    MatTooltipModule, MatSelectModule],
  selector: 'app-schedule-add-license-dialog',
  templateUrl: './schedule-add-license-dialog.component.html',
  styleUrls: ['./schedule-add-license-dialog.component.scss']
})
export class ScheduleAddLicenseDialogComponent implements OnInit {

  @ViewChild('fileWithPids', { static: true }) fileWithPids: ElementRef;

  inProgress = false;

  pids;
  title;
  fixed = false;

  licenses: any[];
  license: string;

  pidsCounter = 0;
  scheduledCounter = 0;
  progressBarMode: ProgressBarMode = 'indeterminate';

  constructor(public dialogRef: MatDialogRef<ScheduleAddLicenseDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private adminApi: AdminApiService) {
    if (data) {
      this.fixed = true;
      this.pids = data.pid;
      this.title = data.title;
      this.fetchAvailableLicenses(data.licenses);
    } else {
      this.fetchAvailableLicenses();
    }
  }

  fetchAvailableLicenses(licensesToExclude: any[] = []) {
    this.inProgress = true;
    this.adminApi.getAllLicenses(false).subscribe((licenses: License[]) => {

      let tmpLicenses =  licenses.filter(lic => licensesToExclude.indexOf(lic.name) == -1);
      let globalLicenses = tmpLicenses.filter(lic=> lic.group !='local'); 
      let localLicenses = tmpLicenses.filter(lic=> lic.group =='local');

      this.licenses = globalLicenses.concat(localLicenses);


      //this.licenses = licenses.map((lic) => lic.name).filter(lic => licensesToExclude.indexOf(lic) == -1)
      this.inProgress = false;
    });
  }

  ngOnInit() {
  }

  schedule() {
    this.inProgress = true;
    const pidlist = this.splitPids(this.pids);
    const license = this.license; 
    this.adminApi.scheduleProcess({
      defid: 'add_license',
      params: {
        license: license,
        pidlist: pidlist.length == 1 ? undefined : pidlist,
        pid: pidlist.length == 1 ? pidlist[0] : undefined,
      }
    }).subscribe(
      {
        next: (response: any) => {
          this.dialogRef.close("scheduled");
        },
        error: (error: any) => {
            console.log(error);
            this.dialogRef.close('error');
          }
      }
      
    //   (response: any) => {
    //   this.dialogRef.close("scheduled");
    // }, error => {
    //   console.log(error);
    //   this.dialogRef.close('error');
    // }
  );
  }

  splitPids(pids: string) {
    //uuid:123 uuid:456,uuid:789;uuid:012, uuid:345; uuid:678    uuid:901
    //uuid:123 uuid:456,uuid:789;uuid:012, uuid:345; uuid:678    uuid:901 xxx
    if (pids) {
      return pids
        .split(/[\s,;]+/) //split by white spaces, ',', ';'
        .filter(n => n); //remove empty strings
    }
    return [];
  }

  getProgress() {
    return Math.floor(this.scheduledCounter / this.pidsCounter * 100);
  }

  onSelectFile(event: any): void {
    //console.log('fileList', event);
    let fileReader: FileReader = new FileReader();
    fileReader.onload = (e) => {
      this.pids = String(fileReader.result);
    }
    fileReader.readAsText(event.target.files[0]);
  }

  onPidsFromFile() {
    let el: HTMLElement = this.fileWithPids.nativeElement;
    el.click();
  }

  isValid() {
    //return form.valid //nefunguje, kdyz je textarea disabled (protoze fixed)
    return this.pids && this.license;
  }

}
