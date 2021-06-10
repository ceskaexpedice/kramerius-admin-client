import { ElementRef, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ScheduleChangePolicyByPidDialogComponent } from 'src/app/dialogs/schedule-change-policy-by-pid-dialog/schedule-change-policy-by-pid-dialog.component';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { ClientApiService } from 'src/app/services/client-api.service';
import { CollectionsService } from 'src/app/services/collections.service';
import { UIService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-policy',
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.scss']
})
export class PolicyComponent implements OnInit {

  @ViewChild('fileWithPids', undefined) fileWithPids: ElementRef;
  pidsFromFile = undefined;

  constructor(
    private collectionsService: CollectionsService,
    private adminApi: AdminApiService,
    private clientApi: ClientApiService,
    private dialog: MatDialog,
    private ui: UIService
  ) { }

  ngOnInit() {
  }

  openChangePolicyDialog() {
    const data = {
      pids: this.pidsFromFile
    }
    const dialogRef = this.dialog.open(ScheduleChangePolicyByPidDialogComponent, { data: data });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar("Nepodařilo se naplánovat změny viditelnosti")
      } else if (result === 'cancel') {
        //nothing
      } else {
        this.ui.showInfoSnackBar(`Byly naplánovány změny viditelnosti pro ${result} objektů`);
      }
      //clear selected file
      this.fileWithPids.nativeElement.value = null;
      this.pidsFromFile = undefined;
    });
  };

  onSelectFile(fileList: FileList): void {
    let fileReader: FileReader = new FileReader();
    fileReader.onload = (e) => {
      this.pidsFromFile = fileReader.result;
    }
    fileReader.readAsText(fileList[0]);
  }

}
