import { CommonModule } from '@angular/common';
import { Component, OnInit, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from 'ngx-flexible-layout';

@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, FlexLayoutModule, FormsModule, MatDialogModule,
    MatButtonModule, MatIconModule, MatTooltipModule,
   MatCardModule],
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
