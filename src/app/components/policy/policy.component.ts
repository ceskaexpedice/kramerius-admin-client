import { ElementRef, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ScheduleChangePolicyByPidDialogComponent } from 'src/app/dialogs/schedule-change-policy-by-pid-dialog/schedule-change-policy-by-pid-dialog.component';
import { UIService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-policy',
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.scss']
})
export class PolicyComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private ui: UIService
  ) { }

  ngOnInit() {
  }

  openChangePolicyDialog() {
    const dialogRef = this.dialog.open(ScheduleChangePolicyByPidDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar("Nepodařilo se naplánovat změny viditelnosti")
      } else if (result === 'cancel' || result === undefined) {
        //nothing
      } else {
        this.ui.showInfoSnackBar(`Byly naplánovány změny viditelnosti pro ${result} objektů`);
      }
    });
  };

}
