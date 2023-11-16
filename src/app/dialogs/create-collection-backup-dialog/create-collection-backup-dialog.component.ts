import { Component, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UIService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-create-collection-backup-dialog',
  templateUrl: './create-collection-backup-dialog.component.html',
  styleUrls: ['./create-collection-backup-dialog.component.scss']
})
export class CreateCollectionBackupDialogComponent implements OnInit {
  
  private routerLink: string = 'processes';

  constructor(
    public dialogRef: MatDialogRef<CreateCollectionBackupDialogComponent>,
    private router: Router,
    private ui: UIService
  ) { }

  ngOnInit(): void {
  }


  createCollectionBackup(routerLink) {
    this.routerLink = routerLink;

    this.dialogRef.close(
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this.router.navigate([routerLink]))
    );

    this.ui.showInfoSnackBar('snackbar.success.startTheProcess');
    // todo error snack bar is ready as bellow
    //this.ui.showErrorSnackBar('snackbar.error.startTheProcess');
  }

}
