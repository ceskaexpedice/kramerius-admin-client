import { Component, Inject, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { UIService } from 'src/app/services/ui.service';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { CollectionsService } from 'src/app/services/collections.service';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';



@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, MatDialogModule,
    MatButtonModule, MatIconModule, MatCardModule, MatTooltipModule],
  selector: 'app-delete-selected-items-from-collection',
  templateUrl: './delete-selected-items-from-collection.component.html',
  styleUrls: ['./delete-selected-items-from-collection.component.scss']
})
export class DeleteSelectedItemsFromCollectionComponent implements OnInit {

  private routerLink: string = 'processes';

  constructor(
    public dialogRef: MatDialogRef<DeleteSelectedItemsFromCollectionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private ui: UIService,
    private adminService: AdminApiService,
    private collectionsService: CollectionsService
  ) { }

  ngOnInit(): void {
  }

  getCurrentRoute() {
    return this.router.url;
  }


  schedulerDeleteSelectedItemsAndClose() {
    let todelete = this.data['todelete'];
    let colid = this.data['pid'];  

    this.collectionsService.removeBatchItemsFromCollection(colid, todelete).subscribe( () => {
      this.dialogRef.close('deleted');
      this.ui.showInfoSnackBar(`snackbar.success.removeFromThisCollection`); 
    });
  }

  scheduleDeleteSelectedItemsAndChangeRoute(routerLink: string) {
    
    let todelete = this.data['todelete'];
    let colid = this.data['pid'];  

    this.collectionsService.removeBatchItemsFromCollection(colid, todelete).subscribe( () => {
      this.routerLink = routerLink;
      this.ui.showInfoSnackBar('snackbar.success.scheduleDeleteSelectedItemsFromCollection');
      this.dialogRef.close(
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
        this.router.navigate([routerLink]))
      );
    });

    this.routerLink = routerLink;
    this.ui.showInfoSnackBar('snackbar.success.scheduleDeleteSelectedItemsFromCollection');
    this.dialogRef.close(
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
        this.router.navigate([routerLink]))
    );
  }

}
