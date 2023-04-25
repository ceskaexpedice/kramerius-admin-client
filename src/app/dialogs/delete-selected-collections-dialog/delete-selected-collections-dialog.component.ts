import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CollectionsService } from 'src/app/services/collections.service';
import { Observable, Subject } from 'rxjs'; // autocomplete
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
  
    this.subject.pipe(
      debounceTime(400)
    ).subscribe(searchTextValue => {
      //this.router.navigate(['/', this.routerLink]);
      this.dialogRef.close(this.routerLink);
    });
  }

  

  deleteSelectedCollections(routerLink) {
    this.routerLink = routerLink;
    this.data.selection.forEach(one=> {
      this.colApi.deleteCollection(one).subscribe(res=> {
        this.subject.next(one);
      },(error)=>{
        console.log("not deleted "+error);
      })
    });
    this.router.navigate(['/', this.routerLink]);
  }
}
