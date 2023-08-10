import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { UIService } from 'src/app/services/ui.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-schedule-change-order-licenses-dialog',
  templateUrl: './schedule-change-order-licenses-dialog.component.html',
  styleUrls: ['./schedule-change-order-licenses-dialog.component.scss']
})
export class ScheduleChangeOrderLicensesDialogComponent implements OnInit {

  private routerLink: string = 'processes';

  constructor(
    public dialogRef: MatDialogRef<ScheduleChangeOrderLicensesDialogComponent>,
    private router: Router,
    private ui: UIService
  ) { }

  ngOnInit(): void {
  }

  getCurrentRoute() {
    return this.router.url;
  }

  scheduleChangeOrderLicenses(routerLink) {
    this.routerLink = routerLink;
    this.ui.showInfoSnackBar('snackbar.success.scheduleChangeItemsOrder');
    this.dialogRef.close(
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this.router.navigate([routerLink]))
    );

    // todo - this snackbar is ready for error state
    // this.ui.showInfoSnackBar('snackbar.error.scheduleChangeItemsOrder');
  }
}
