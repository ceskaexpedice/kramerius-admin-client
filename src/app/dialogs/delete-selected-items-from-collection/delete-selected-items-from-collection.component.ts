import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { UIService } from 'src/app/services/ui.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-selected-items-from-collection',
  templateUrl: './delete-selected-items-from-collection.component.html',
  styleUrls: ['./delete-selected-items-from-collection.component.scss']
})
export class DeleteSelectedItemsFromCollectionComponent implements OnInit {

  private routerLink: string = 'processes';

  constructor(
    public dialogRef: MatDialogRef<DeleteSelectedItemsFromCollectionComponent>,
    private router: Router,
    private ui: UIService
  ) { }

  ngOnInit(): void {
  }

  getCurrentRoute() {
    return this.router.url;
  }

  scheduleDeleteSelectedItemsFromCollection(routerLink) {
    this.routerLink = routerLink;
    this.ui.showInfoSnackBar('snackbar.success.scheduleDeleteSelectedItemsFromCollection');
    this.dialogRef.close(
      setTimeout(() => {
        window.location.href=this.routerLink
      }, 800)
    );

    // todo - this snackbar is ready for error state
    // this.ui.showInfoSnackBar('snackbar.error.scheduleDeleteSelectedItemsFromCollection');
  }

}
