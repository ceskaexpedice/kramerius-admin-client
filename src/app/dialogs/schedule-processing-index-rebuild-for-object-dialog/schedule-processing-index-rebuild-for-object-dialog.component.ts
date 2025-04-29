import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule, ProgressBarMode } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { AdminApiService } from 'src/app/services/admin-api.service';


@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, MatDialogModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
  MatProgressBarModule, MatTooltipModule],
  selector: 'app-schedule-processing-index-rebuild-for-object-dialog',
  templateUrl: './schedule-processing-index-rebuild-for-object-dialog.component.html',
  styleUrls: ['./schedule-processing-index-rebuild-for-object-dialog.component.scss']
})
export class ScheduleProcessingIndexRebuildForObjectDialogComponent implements OnInit {

  @ViewChild('fileWithPids', { static: true }) fileWithPids: ElementRef;


  fixed = false;
  inProgress = false;

  pidsTextareaRows = 4;
  pids = "";
  title: string = undefined;
  
  pidsCounter = 0;
  scheduledCounter = 0;
  progressBarMode: ProgressBarMode = 'indeterminate';

  constructor(public dialogRef: MatDialogRef<ScheduleProcessingIndexRebuildForObjectDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private adminApi: AdminApiService) {
    if (data) {
      this.fixed = true;
      this.pids = data.pid;
      this.title = data.title;
      this.pidsTextareaRows = 1;
    }
  }

  ngOnInit() {
  }

  schedule(formData: any) {
    this.inProgress = true;
    const pids = this.splitPids(this.pids);

    this.pidsCounter = pids.length;
    this.scheduledCounter = 0;

    let requests: any[] = [];
    pids.forEach(pid => {
      requests.push(
        this.adminApi.scheduleProcess({
          defid: 'processing_rebuild_for_object',
          params: { pid: pid }
        }, () => this.scheduledCounter++)
      );
    });

    this.progressBarMode = 'determinate';

    forkJoin(requests).subscribe(result => {
      this.dialogRef.close(this.scheduledCounter);
    }, error => {
      console.log(error);
      this.dialogRef.close('error');
    });
  }

  splitPids(pids: string): string[] {
    if (pids) {
      return pids
        .split(/[\s,;]+/)
        .filter(n => n);
    } else {
      return [];
    }
  }

  onSelectFile(event: any): void {
    console.log('fileList', event);
    const fileReader: FileReader = new FileReader();
    fileReader.onload = () => {
      this.pids = String(fileReader.result);
    };
    fileReader.readAsText(event.target.files[0]);
  }

  onPidsFromFile() {
    console.log('onPidsFromFile');
    const el: HTMLElement = this.fileWithPids.nativeElement;
    el.click();
  }

  getProgress() {
    return this.pidsCounter > 0
      ? Math.floor((this.scheduledCounter / this.pidsCounter) * 100)
      : 0;
  }
}