import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { AdminApiService } from 'src/app/services/admin-api.service';

@Component({
  selector: 'app-schedule-delete-objects-smart',
  templateUrl: './schedule-delete-objects-smart.component.html',
  styleUrls: ['./schedule-delete-objects-smart.component.scss']
})
export class ScheduleDeleteObjectsSmartComponent implements OnInit {

  @ViewChild('fileWithPids', { static: true }) fileWithPids: ElementRef;

  inProgress = false;

  pids;
  title;
  fixed = false;

  pidsCounter = 0;
  scheduledCounter = 0;
  progressBarMode = 'indeterminate';

  constructor(public dialogRef: MatDialogRef<ScheduleDeleteObjectsSmartComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private adminApi: AdminApiService) {
    if (data) {
      this.fixed = true;
      this.pids = data.pid;
      this.title = data.title;
    }
  }

  ngOnInit(): void {
  }

  schedule(formData) {
    this.inProgress = true;
    const pidlist = this.splitPids(this.pids);
    let requests = [];
    pidlist.forEach(pid => {
      requests.push(
        this.adminApi.scheduleProcess({
          defid: 'delete_tree',
          params: {
            pid: pid,
            title: this.title,
          }
        })
      );
    })
    //TODO: namisto forkJoin pocitat uspesne a neuspesne, ted je to bud "proslo vse", nebo "chyba"
    forkJoin(requests).subscribe(result => {
      this.dialogRef.close(result.length);
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
    return this.pids;
  }

}
