import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { License } from 'src/app/models/license.model';
import { AdminApiService } from 'src/app/services/admin-api.service';

@Component({
  selector: 'app-schedule-remove-license-dialog',
  templateUrl: './schedule-remove-license-dialog.component.html',
  styleUrls: ['./schedule-remove-license-dialog.component.scss']
})
export class ScheduleRemoveLicenseDialogComponent implements OnInit {

  @ViewChild('fileWithPids', { static: true }) fileWithPids: ElementRef;

  inProgress = false;

  pids;
  title;
  fixed = false;

  licenses;
  license;

  pidsCounter = 0;
  scheduledCounter = 0;
  progressBarMode = 'indeterminate';

  constructor(public dialogRef: MatDialogRef<ScheduleRemoveLicenseDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private adminApi: AdminApiService) {
    if (data) {
      this.fixed = true;
      this.pids = data.pid;
      this.title = data.title;
      this.license = data.license;
      this.licenses = data.licenses;
    } else {
      this.fetchAvailableLicenses();
    }
  }

  fetchAvailableLicenses() {
    this.inProgress = true;
    this.adminApi.getAllLicenses().subscribe((licenses: License[]) => {
      //this.licenses = licenses.map((lic) => lic.name);
      this.license = licenses[0];

      let tmpLicenses =  licenses;
      let globalLicenses = tmpLicenses.filter(lic=> lic.group !='local'); 
      let localLicenses = tmpLicenses.filter(lic=> lic.group =='local');

      this.licenses = globalLicenses.concat(localLicenses);

      this.inProgress = false;
    });
  }

  ngOnInit() {
  }

  schedule(formData) {
    this.inProgress = true;
    const pidlist = this.splitPids(this.pids);
    const license = this.license; //formData.license;
    this.adminApi.scheduleProcess({
      defid: 'remove_license',
      params: {
        license: license,
        pidlist: pidlist.length == 1 ? undefined : pidlist,
        pid: pidlist.length == 1 ? pidlist[0] : undefined,
      }
    }).subscribe(response => {
      this.dialogRef.close("scheduled");
    }, error => {
      console.log(error);
      this.dialogRef.close('error');
    });
  }

  splitPids(pids: string) {
    //uuid:123 uuid:456,uuid:789;uuid:012, uuid:345; uuid:678    uuid:901
    //uuid:123 uuid:456,uuid:789;uuid:012, uuid:345; uuid:678    uuid:901 xxx
    if (pids) {
      return pids
        .split(/[\s,;]+/) //split by white spaces, ',', ';'
        .filter(n => n); //remove empty strings
    }
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

  isValid(form) {
    //return form.valid //nefunguje, kdyz je textarea disabled (protoze fixed)
    return this.pids && this.license;
  }

}
