import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-collection-dialog',
  templateUrl: './delete-collection-dialog.component.html',
  styleUrls: ['./delete-collection-dialog.component.scss']
})
export class DeleteCollectionDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DeleteCollectionDialogComponent>
  ) { }

  ngOnInit(): void {
  }

  onClose(data: string) {
    this.dialogRef.close(data);
  }

}
