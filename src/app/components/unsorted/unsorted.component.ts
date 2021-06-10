import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ScheduleChangePolicyByPidDialogComponent as ScheduleChangePolicyByPidDialogComponent } from 'src/app/dialogs/schedule-change-policy-by-pid-dialog/schedule-change-policy-by-pid-dialog.component';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { ClientApiService } from 'src/app/services/client-api.service';
import { CollectionsService } from 'src/app/services/collections.service';
import { UIService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-unsorted',
  templateUrl: './unsorted.component.html',
  styleUrls: ['./unsorted.component.scss']
})
export class UnsortedComponent implements OnInit {

  constructor(
    private collectionsService: CollectionsService,
    private adminApi: AdminApiService,
    private clientApi: ClientApiService,
    private dialog: MatDialog,
    private ui: UIService
  ) { }

  ngOnInit() {
  }

  openChangePolicyDialog(object: { pids: string } = null) {
    const dialogRef = this.dialog.open(ScheduleChangePolicyByPidDialogComponent, { data: object });
    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      if (result === 'error') {
        this.ui.showErrorSnackBar("Nepodařilo se naplánovat změny viditelnosti")
      } else if (result === 'cancel') {
        //nothing
      } else {
        this.ui.showInfoSnackBar(`Byly naplánovány změny viditelnosti pro ${result} objektů`);
      }
    });
  };

}
