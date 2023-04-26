import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CollectionsService } from 'src/app/services/collections.service';
import { Observable, Subject, forkJoin } from 'rxjs'; // autocomplete
import { debounceTime } from 'rxjs/operators';
import { Router } from "@angular/router";


@Component({
  selector: 'app-delete-selected-collections-dialog',
  templateUrl: './delete-selected-collections-dialog.component.html',
  styleUrls: ['./delete-selected-collections-dialog.component.scss']
})
export class DeleteSelectedCollectionsDialogComponent implements OnInit {

  private subject: Subject<string> = new Subject();
  private routerLink:string = 'processes';

  constructor(public dialogRef: MatDialogRef<DeleteSelectedCollectionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private colApi: CollectionsService) { }

  ngOnInit(): void {
  
  }

  

  deleteSelectedCollections(routerLink) {
    this.routerLink = routerLink;

    let requests = [];
    this.data.selection.forEach(one=>{
      requests.push(this.colApi.deleteCollection(one));
    });

    forkJoin(requests).subscribe(result => {
      console.log(" Result is "+result);
      this.dialogRef.close(this.routerLink);
    }, error => {
      this.dialogRef.close('error');
    });
  }



  
}
