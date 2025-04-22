import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CollectionsService } from 'src/app/services/collections.service';
import { Observable, Subject, forkJoin } from 'rxjs'; // autocomplete
import { debounceTime } from 'rxjs/operators';
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
    private ui: UIService) { }

  ngOnInit(): void {
  
  }

  

  deleteSelectedCollections(routerLink: string) {
    this.routerLink = routerLink;

    let requests: any[] = [];
    this.data.selection.forEach((one: Collection)=>{
      requests.push(this.colApi.deleteCollection(one));
    });

    forkJoin(requests).subscribe(result => {
      this.dialogRef.close(
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
        this.router.navigate([routerLink]))
      );
      this.ui.showInfoSnackBar('snackbar.success.deleteSelectedCollections');
    }, error => {
      this.dialogRef.close('error');
      this.ui.showErrorSnackBar("snackbar.error.deleteSelectedCollections");
    });
  }



  
}
