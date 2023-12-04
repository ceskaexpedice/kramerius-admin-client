import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UIService } from 'src/app/services/ui.service';
import { CreateCollectionBackupDialogComponent } from '../create-collection-backup-dialog/create-collection-backup-dialog.component';
import { AdminApiService } from 'src/app/services/admin-api.service';
import * as moment from 'moment';
import { FileDownloadService } from 'src/app/services/file-download';

@Component({
  selector: 'app-restore-from-collection-backup-dialog',
  templateUrl: './restore-from-collection-backup-dialog.component.html',
  styleUrls: ['./restore-from-collection-backup-dialog.component.scss']
})
export class RestoreFromCollectionBackupDialogComponent implements OnInit {
  
  private routerLink: string = 'processes';

  public backups: Array<any>;
  public selectedFile:any;

  constructor(
    public dialogRef: MatDialogRef<RestoreFromCollectionBackupDialogComponent>,
    private router: Router,
    private ui: UIService,
    private adminApi: AdminApiService,
    private downloadService: FileDownloadService
  ) { }

  ngOnInit(): void {

    this.adminApi.getOutputCollectionsBackupsDirFiles().subscribe(response => {
      this.backups = [];
      response.files.forEach(file => {
          this.backups.push(file);
      });
    }, error => {
      console.log(error);
    })

  }

  getDateTime(file) {
    const date = new Date(file.lastModifiedTime);    
  }


  modifiedLogFile(logfile) {
    
    if (logfile.lastModifiedTime) {

      const date = moment(logfile.lastModifiedTime);
      const formattedDateTime = date.format('DD/MM/YYYY HH:mm:ss');
      return formattedDateTime;
      
    } else return 'none';
  }

  restoreFromCollectionBackup(routerLink) {
    this.dialogRef.close({
      "routerLink": routerLink,
      "backupname": this.selectedFile
   });
   /*
   this.routerLink = routerLink;

    this.dialogRef.close(
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this.router.navigate([routerLink]))
    );

    this.ui.showInfoSnackBar('snackbar.success.startTheProcess');
    */
  }

  download(backup) {
    this.adminApi.getOutputCollectionsBackupsFile( backup ).subscribe(response => {
      let downloadlink = this.adminApi.getOutputDownloadLinks(response.downloadlink);
      this.downloadService.downloadFile(downloadlink, backup);
    }, error => {
      console.log(error);
    })
  }


}
