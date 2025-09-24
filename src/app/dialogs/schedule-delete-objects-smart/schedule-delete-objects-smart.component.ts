import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';

import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule, ProgressBarMode } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, MatDialogModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
  MatProgressBarModule, MatTooltipModule, MatCheckboxModule],
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
  ignoreIncosistencies:boolean = true;

  pidsCounter = 0;
  scheduledCounter = 0;
  progressBarMode: ProgressBarMode = 'indeterminate';

  constructor(public dialogRef: MatDialogRef<ScheduleDeleteObjectsSmartComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private adminApi: AdminApiService) {
    if (data) {
      this.fixed = true;
      this.pids = data.pid;
      this.title = data.title;
    }
  }

  ngOnInit(): void {
  }


  modelChange() {
    console.log("Model change");
  }

  schedule(formData: any) {
    this.inProgress = true;
    const pidlist = this.splitPids(this.pids);
    let requests: any[] = [];
    pidlist.forEach(pid => {
      requests.push(
        this.adminApi.scheduleProcess({
          defid: 'delete_tree',
          params: {
            pid: pid,
            title: this.title,
            ignoreIncosistencies:  formData['ignoreIncosistencies']
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
    return this.pids;
  }

}
