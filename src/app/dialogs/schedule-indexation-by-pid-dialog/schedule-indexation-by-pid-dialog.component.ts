import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule, ProgressBarMode } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from 'ngx-flexible-layout';
import { forkJoin } from 'rxjs';
import { AdminApiService } from 'src/app/services/admin-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, FlexLayoutModule, FormsModule, MatDialogModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule,
  MatProgressBarModule, MatTooltipModule],
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
  title: string = undefined;
  fixed = false;

  pidsCounter = 0;
  scheduledCounter = 0;
  progressBarMode: ProgressBarMode = 'indeterminate';
  pidsTextareaRows = 4;

  constructor(public dialogRef: MatDialogRef<ScheduleIndexationByPidDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private adminApi: AdminApiService) {
    if (data) {
      this.fixed = true;
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

  schedule(formData: any) {
    this.inProgress = true;
    const pids = this.splitPids(this.pids);

    this.pidsCounter = pids.length;
    this.scheduledCounter = 0;

    const title = this.title;
    const ignoreInconsistentObjects = formData.ignore_inconsistent_objects;
    const type = formData.type;

    let requests: any[] = [];
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
    } else {
      return [];
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
