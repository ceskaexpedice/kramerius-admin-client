import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { Collection } from 'src/app/models/collection.model';
import { CollectionsService } from 'src/app/services/collections.service';
import { UIService } from 'src/app/services/ui.service';


@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, MatDialogModule,
    MatButtonModule, MatIconModule, MatCardModule, MatTooltipModule],
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
  goToRoute(routerLink: string) {
    this.ui.showInfoSnackBar("snackbar.success.collectionHasBeenCreated");
    this.dialogRef.close(
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this.router.navigate([routerLink]))
    );
  }
}
