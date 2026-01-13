import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CollectionsService } from 'src/app/services/collections.service';
import { Observable, Subject, forkJoin, of } from 'rxjs'; // autocomplete
import { catchError, debounceTime, switchMap, take } from 'rxjs/operators';
import { Router } from "@angular/router";
import { UIService } from 'src/app/services/ui.service';
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { TranslateModule } from "@ngx-translate/core";
import { Collection } from "src/app/models/collection.model";
import { AdminApiService } from "src/app/services/admin-api.service";


@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, MatDialogModule,
    MatButtonModule, MatIconModule, MatCardModule, MatTooltipModule],
  selector: 'app-delete-selected-collections-dialog',
  templateUrl: './delete-selected-collections-dialog.component.html',
  styleUrls: ['./delete-selected-collections-dialog.component.scss']
})
export class DeleteSelectedCollectionsDialogComponent implements OnInit {

  private subject: Subject<string> = new Subject();
  private routerLink: string = 'processes';

  constructor(public dialogRef: MatDialogRef<DeleteSelectedCollectionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private colApi: CollectionsService,
    private adminApi: AdminApiService,
    private ui: UIService) { }

  ngOnInit(): void {
  
  }

  

  deleteSelectedCollections(routerLink: string) {
    this.routerLink = routerLink;

    const requests = this.data.selection.map((one: Collection) => {
      return this.colApi.deleteCollection(one).pipe(take(1));
    });

    if (requests.length === 0) return;

    forkJoin(requests).subscribe({
      next: (results) => {
        this.ui.showInfoSnackBar('snackbar.success.deleteSelectedCollections');
        this.dialogRef.close(
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
            this.router.navigate([routerLink])
          )
        );
      },
      error: (error) => {
        this.ui.showErrorSnackBar("snackbar.error.deleteSelectedCollections");
        this.dialogRef.close('error');
      }
    });
  }



  
}
