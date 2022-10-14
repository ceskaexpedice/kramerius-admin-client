import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-collection',
  templateUrl: './delete-collection.component.html',
  styleUrls: ['./delete-collection.component.scss']
})
export class DeleteCollectionComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DeleteCollectionComponent>
  ) { }

  ngOnInit(): void {
  }

  onClose(data: string) {
    this.dialogRef.close(data);
  }

}
