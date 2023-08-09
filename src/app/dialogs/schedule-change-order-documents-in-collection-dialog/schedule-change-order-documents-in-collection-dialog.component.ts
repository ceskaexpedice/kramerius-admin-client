import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { ActivatedRoute } from '@angular/router';
import { UIService } from 'src/app/services/ui.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-schedule-change-order-documents-in-collection-dialog',
  templateUrl: './schedule-change-order-documents-in-collection-dialog.component.html',
  styleUrls: ['./schedule-change-order-documents-in-collection-dialog.component.scss']
})
export class ScheduleChangeOrderDocumentsInCollectionDialogComponent implements OnInit {

  private routerLink: string = 'processes';

  constructor(
    public dialogRef: MatDialogRef<ScheduleChangeOrderDocumentsInCollectionDialogComponent>,
    private router: Router,
    private route: ActivatedRoute,
    private ui: UIService
  ) { }

  ngOnInit(): void {
  }

  getCurrentRoute() {
    return this.router.url;
  }

  scheduleChangeOrderDocumentsInCollection(routerLink) {
    this.routerLink = routerLink;
    this.ui.showInfoSnackBar('snackbar.success.scheduleChangeItemsOrder');
    this.dialogRef.close(
      setTimeout(() => {
        window.location.href=this.routerLink
      }, 800)
    );

    // todo - this snackbar is ready for error state
    // this.ui.showInfoSnackBar('snackbar.error.scheduleChangeItemsOrder');
  }

}
