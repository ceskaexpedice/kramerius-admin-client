import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ScheduleReHarvestSpecificPidsDialogComponent } from 'src/app/dialogs/schedule-re-harvest-specific-pids-dialog/schedule-re-harvest-specific-pids-dialog.component';
import { Reharvest } from 'src/app/models/cdk.library.model';
import { CdkApiService } from 'src/app/services/cdk-api.service';
import { UIService } from 'src/app/services/ui.service';

// --- data mock to delete ---
/*
export interface objectReharvest {
  date: string;
  pid: string;
  deleteObject: boolean;
  description: string;
  state: string;
}

const ELEMENT_DATA: objectReharvest[] = [
  {date: '20.4.2024', pid: 'uuid:3a99c250-bc5d-4318-a5a8-db00547fd5c4', deleteObject: true, description: 'Manualni reharvest objektu z MZK, KNAV', state: 'PLANNED'},
  {date: '24.4.2024', pid: 'uuid:c9b6c867-6d60-4a64-9519-95f5e66ea910', deleteObject: false, description: 'Neplanovany reharvest objektu z duvodu dila/stranky', state: 'FINISHED'},
  {date: '20.4.2024', pid: 'uuid:3a99c250-bc5d-4318-a5a8-db00547fd5c4', deleteObject: true, description: 'Manualni reharvest objektu z MZK, KNAV', state: 'PLANNED'},
  {date: '24.4.2024', pid: 'uuid:c9b6c867-6d60-4a64-9519-95f5e66ea910', deleteObject: false, description: 'Neplanovany reharvest objektu z duvodu dila/stranky', state: 'FINISHED'}
];
*/
// -- data mock to delete ---

@Component({
  selector: 'app-cdk-object-reharvest',
  templateUrl: './cdk-object-reharvest.component.html',
  styleUrls: ['./cdk-object-reharvest.component.scss']
})
export class CdkObjectReharvestComponent implements OnInit {

  displayedColumns: string[] = ['date', 'pid', 'state', 'description', 'pod'];
  //dataSource = ELEMENT_DATA;

  dataSource:Reharvest[];

  constructor(
    private dialog: MatDialog,
    private ui: UIService,
    private cdkApi: CdkApiService
  ) { }

  ngOnInit(): void {
    this.cdkApi.reharvests().subscribe(resp=> {
      this.dataSource = resp;
      this.dataSource.sort((a, b) => b.getDateTime().getTime() - a.getDateTime().getTime());
    });
 }

 openScheduledReHarvestSpecificPidsDialog() {
  const dialogRef = this.dialog.open(ScheduleReHarvestSpecificPidsDialogComponent, {
    width: '600px',
    panelClass: 'app-schedule-re-harvest-specific-pids-dialog'
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result === 'error') {
      this.ui.showErrorSnackBar('snackbar.error.scheduleRemovePolicyByPid')
    } else if (result === 'cancel' || result === undefined) {
      //nothing, dialog was closed
    } else if (result == 1) {
      this.ui.showInfoSnackBar('snackbar.success.scheduleRemovePolicyByPid.1');
    } else if (result == 2 || result == 3 || result == 4) {
      this.ui.showInfoSnackBar('snackbar.success.scheduleRemovePolicyByPid.2-4', {value: result});
    } else {
      this.ui.showInfoSnackBar('snackbar.success.scheduleRemovePolicyByPid.more', {value: result});
    }
    this.cdkApi.reharvests().subscribe(resp=> {
      this.dataSource = resp;
      this.dataSource.sort((a, b) => b.getDateTime().getTime() - a.getDateTime().getTime());
    });

  })

}



}
