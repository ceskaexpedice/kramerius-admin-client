import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCard, MatCardContent } from "@angular/material/card";
import { AdminApiService } from 'src/app/services/admin-api.service';
import { UIService } from 'src/app/services/ui.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCard,
    MatCardContent
],
  selector: 'app-fix-logs-dialog',
  templateUrl: './fix-logs-dialog.component.html',
  styleUrls: ['./fix-logs-dialog.component.scss']
})
export class FixLogsDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<FixLogsDialogComponent>,
    private adminApi: AdminApiService,
    private ui: UIService) { }

  ngOnInit(): void {
  }

  startFixProcess(){
    this.adminApi.scheduleProcess({
      defid: 'update-logs',
      params: {
      }
    }).subscribe(
      {
        next: (response: any) => {
          this.dialogRef.close("scheduled");
          this.ui.showInfoSnackBar('snackbar.success.scheduleFixLogProcess');
        },
        error: (error: any) => {
            console.log(error);
            this.dialogRef.close('error');
          }
      }
      
      /*
          }).subscribe(response => {
      this.ui.showInfoSnackBar('snackbar.success.scheduleImportProcess');
    }, error => {
      this.ui.showInfoSnackBar('snackbar.error.scheduleImportProcess');
      console.log(error);
    });
*/

    //   (response: any) => {
    //   this.dialogRef.close("scheduled");
    // }, error => {
    //   console.log(error);
    //   this.dialogRef.close('error');
    // }
  );

  }

}