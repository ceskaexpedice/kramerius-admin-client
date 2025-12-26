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
import { Subject, switchMap, takeUntil, takeWhile, timer } from 'rxjs';

import { Collection } from 'src/app/models/collection.model';
import { AdminApiService } from 'src/app/services/admin-api.service';
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

  /*
               return { 
                collection: response, 
                process: processRes 
              };
 */

  collection: Collection;
  processUuid: string;
  isProcessFinished: boolean = false;
  
  private destroy$ = new Subject<void>();

  data: any;
  collectionPid: string;

  constructor(
    public dialogRef: MatDialogRef<CreateNewCollectionDialogComponent>,
    private router: Router,
    private ui: UIService,
    private adminService: AdminApiService,
    private collectionsService: CollectionsService,
    @Inject(MAT_DIALOG_DATA) public d: any
  ) { 
    this.data = d 
  }

  ngOnInit(): void {

    this.collectionPid = this.data.collection.collection.pid;
    this.processUuid = this.data.process?.processId;

    if (this.processUuid) {
      this.checkProcessStatus();
    }
  }

  checkProcessStatus() {
    timer(0, 3000).pipe(
      switchMap(() => this.adminService.getProcessByUuid(this.processUuid)),
      takeUntil(this.destroy$),
      takeWhile(([batch, process]) => process.state !== 'FINISHED', true) 
    ).subscribe(([batch, process]) => {
      if (process.state === 'FINISHED') {
        this.isProcessFinished = true;
      }
    });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
