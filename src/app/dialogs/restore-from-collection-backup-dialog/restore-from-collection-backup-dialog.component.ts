import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UIService } from 'src/app/services/ui.service';
import { CreateCollectionBackupDialogComponent } from '../create-collection-backup-dialog/create-collection-backup-dialog.component';

@Component({
  selector: 'app-restore-from-collection-backup-dialog',
  templateUrl: './restore-from-collection-backup-dialog.component.html',
  styleUrls: ['./restore-from-collection-backup-dialog.component.scss']
})
export class RestoreFromCollectionBackupDialogComponent implements OnInit {
  
  private routerLink: string = 'processes';

  public backups: Array<any> = [
    {name: "backup-2023.07.12-2023.08.04.zip", date: "05/10/2023 20:23:34"},
    {name: "backup-2023.07.12-2023.08.04.zip", date: "05/10/2023 20:23:34"},
    {name: "backup-2023.07.12-2023.08.04.zip", date: "05/10/2023 20:23:34"}
  ]

  constructor(
    public dialogRef: MatDialogRef<CreateCollectionBackupDialogComponent>,
    private router: Router,
    private ui: UIService
  ) { }

  ngOnInit(): void {
  }

  restoreFromCollectionBackup(routerLink) {
    this.routerLink = routerLink;

    this.dialogRef.close(
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this.router.navigate([routerLink]))
    );

    this.ui.showInfoSnackBar('snackbar.success.startTheProcess');
    // todo error snack bar is ready as bellow
    //this.ui.showErrorSnackBar('snackbar.error.startTheProcess');
  }

  download(name: any) {
    return name;
  }

}
