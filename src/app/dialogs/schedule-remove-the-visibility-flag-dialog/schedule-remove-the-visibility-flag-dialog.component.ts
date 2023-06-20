import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-schedule-remove-the-visibility-flag-dialog',
  templateUrl: './schedule-remove-the-visibility-flag-dialog.component.html',
  styleUrls: ['./schedule-remove-the-visibility-flag-dialog.component.scss']
})
export class ScheduleRemoveTheVisibilityFlagDialogComponent implements OnInit {

  public inProgress: boolean = false;
  public fixed: boolean = false;
  pids = "";

  constructor() { }

  ngOnInit(): void {
  }

  schedule(formData) {
    // to do
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
    // to do
  }
}
