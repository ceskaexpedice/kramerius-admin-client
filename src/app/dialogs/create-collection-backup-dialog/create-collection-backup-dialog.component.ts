import { Component, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { UIService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-create-collection-backup-dialog',
  templateUrl: './create-collection-backup-dialog.component.html',
  styleUrls: ['./create-collection-backup-dialog.component.scss']
})
export class CreateCollectionBackupDialogComponent implements OnInit {
  
  public routerLink: string = 'processes';
  public backupname:string ='';

  constructor(
    public dialogRef: MatDialogRef<CreateCollectionBackupDialogComponent>,
    private router: Router,
    private ui: UIService,
    private adminApi: AdminApiService

  ) { }

  ngOnInit(): void {
  }


  createCollectionBackup(routerLink) {
    this.dialogRef.close({
       "routerLink": routerLink,
       "backupname": this.backupname
    });
  }

}
