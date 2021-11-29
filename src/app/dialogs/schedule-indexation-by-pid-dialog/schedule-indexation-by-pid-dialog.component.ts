import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { AdminApiService } from 'src/app/services/admin-api.service';

@Component({
  selector: 'app-schedule-indexation-by-pid-dialog',
  templateUrl: './schedule-indexation-by-pid-dialog.component.html',
  styleUrls: ['./schedule-indexation-by-pid-dialog.component.scss']
})
export class ScheduleIndexationByPidDialogComponent implements OnInit {

  @ViewChild('fileWithPids', { static: true }) fileWithPids: ElementRef;

  indexationProcessTypes = ['TREE_AND_FOSTER_TREES', 'OBJECT'];
  indexationProcessTypeNames = ['Úplná', 'Jen objekt'];

  selectedIndexationProcessType = this.indexationProcessTypes[0];
  inProgress = false;

  pids = "";
  title = undefined;

  pidsCounter = 0;
  scheduledCounter = 0;
  progressBarMode = 'indeterminate';
  pidsTextareaRows = 4;

  constructor(public dialogRef: MatDialogRef<ScheduleIndexationByPidDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private adminApi: AdminApiService) {
    if (data) {
      this.pids = data.pid;
      this.title = data.title;
      this.pidsTextareaRows = 1;
    }
  }

  ngOnInit() {
  }

  onSelectFile(event: any): void {
    console.log('fileList', event);
    let fileReader: FileReader = new FileReader();
    fileReader.onload = (e) => {
      this.pids = String(fileReader.result);
    }
    fileReader.readAsText(event.target.files[0]);
  }

  schedule(formData) {
    this.inProgress = true;
    const pids = this.splitPids(this.pids);

    this.pidsCounter = pids.length;
    this.scheduledCounter = 0;

    const title = this.title;
    const ignoreInconsistentObjects = formData.ignore_inconsistent_objects;
    const type = formData.type;

    let requests = [];
    pids.forEach(pid => {
      requests.push(
        this.adminApi.scheduleProcess({
          defid: 'new_indexer_index_object',
          params: {
            type: type,
            pid: pid,
            title: title,
            ignoreInconsistentObjects: ignoreInconsistentObjects
          }
        }, () => this.scheduledCounter++)
      );
    })
    this.progressBarMode = 'determinate';

    forkJoin(requests).subscribe(result => {
      this.dialogRef.close(this.scheduledCounter);
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

  onPidsFromFile() {
    console.log('onPidsFromFile');
    let el: HTMLElement = this.fileWithPids.nativeElement;
    el.click();
  }

  getProgress() {
    return Math.floor(this.scheduledCounter / this.pidsCounter * 100);
  }

}
