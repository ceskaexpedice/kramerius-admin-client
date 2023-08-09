import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Collection } from 'src/app/models/collection.model';
import { CollectionsService } from 'src/app/services/collections.service';
import { UIService } from 'src/app/services/ui.service';


@Component({
  selector: 'app-create-new-collection-dialog',
  templateUrl: './create-new-collection-dialog.component.html',
  styleUrls: ['./create-new-collection-dialog.component.scss']
})
export class CreateNewCollectionDialogComponent implements OnInit {

  collection: Collection;
  data: any;
  collectionPid: string;

  constructor(
    public dialogRef: MatDialogRef<CreateNewCollectionDialogComponent>,
    private router: Router,
    private ui: UIService,
    private collectionsService: CollectionsService,
    @Inject(MAT_DIALOG_DATA) public d: any
  ) { this.data = d }

  ngOnInit(): void {
    this.collectionPid = this.data.pid;
  }

  // go to route and show snackbar
  goToRoute(routerLink) {
    this.ui.showInfoSnackBar("snackbar.success.collectionHasBeenCreated");
    this.dialogRef.close(
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this.router.navigate([routerLink]))
    );
  }
}
