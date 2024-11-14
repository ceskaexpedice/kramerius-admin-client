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
import { FlexLayoutModule } from 'ngx-flexible-layout';
import { forkJoin } from 'rxjs';
import { AdminApiService } from 'src/app/services/admin-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, FlexLayoutModule, FormsModule, MatDialogModule,
    MatButtonModule, MatDividerModule, MatIconModule, MatFormFieldModule, MatInputModule,
  MatProgressBarModule, MatTooltipModule, MatSelectModule],
  selector: 'app-schedule-change-policy-by-pid-dialog',
  templateUrl: './schedule-change-policy-by-pid-dialog.component.html',
  styleUrls: ['./schedule-change-policy-by-pid-dialog.component.scss']
})
export class ScheduleChangePolicyByPidDialogComponent implements OnInit {

  @ViewChild('fileWithPids', { static: true }) fileWithPids: ElementRef;

  fixed = false;

  scopeKeys = ['TREE', 'OBJECT',];
  scopeNames = ['Objekt i s potomky', 'Jen objekt']; //TODO: i18n
  selectedScope = this.scopeKeys[0];

  policies = ['PUBLIC', 'PRIVATE'];

  inProgress = false;

  pids = "";
  title;
  policy;

  pidsCounter = 0;
  scheduledCounter = 0;
  progressBarMode: ProgressBarMode = 'indeterminate';

  constructor(public dialogRef: MatDialogRef<ScheduleChangePolicyByPidDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private adminApi: AdminApiService) {
    if (data) {
      this.fixed = true;
      this.pids = data.pid;
      this.title = data.title;
      this.policy = data.policy;
    }
  }

  translatePolicy(policy: string) {
    //TODO: i18n
    switch (policy) {
      case 'PUBLIC': return 'Veřejné';
      case 'PRIVATE': return 'Neveřejné';
    }
    return policy;
  }

  ngOnInit() {
  }

  schedule(formData: any) {
    this.inProgress = true;

    const pids = this.splitPids(this.pids);
    this.pidsCounter = pids.length;
    this.scheduledCounter = 0;

    const scope = formData.scope;
    const policy = this.policy;//formData.policy;

    let requests: any[] = [];
    pids.forEach(pid => {
      requests.push(
        this.adminApi.scheduleProcess({
          defid: 'set_policy',
          params: {
            scope: scope,
            policy: policy,
            pid: pid,
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

}
