import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from 'ngx-flexible-layout';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { UIService } from 'src/app/services/ui.service';

@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, FlexLayoutModule, FormsModule, MatDialogModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatTooltipModule],
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


  createCollectionBackup(routerLink: string) {
    this.dialogRef.close({
       "routerLink": routerLink,
       "backupname": this.backupname
    });
  }

}
