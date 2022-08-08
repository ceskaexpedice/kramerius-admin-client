import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DeleteStatisticsDialogComponent } from 'src/app/dialogs/delete-statistics-dialog/delete-statistics-dialog.component';
import { GenerateNkpLogsDialogComponent } from 'src/app/dialogs/generate-nkp-logs-dialog/generate-nkp-logs-dialog.component';
import { ScheduleAddLicenseDialogComponent } from 'src/app/dialogs/schedule-add-license-dialog/schedule-add-license-dialog.component';
import { ScheduleChangePolicyByPidDialogComponent } from 'src/app/dialogs/schedule-change-policy-by-pid-dialog/schedule-change-policy-by-pid-dialog.component';
import { ScheduleImportFoxmlDialogComponent } from 'src/app/dialogs/schedule-import-foxml-dialog/schedule-import-foxml-dialog.component';
import { ScheduleImportNdkDialogComponent } from 'src/app/dialogs/schedule-import-ndk-dialog/schedule-import-ndk-dialog.component';
import { ScheduleProcessingIndexRebuildDialogComponent } from 'src/app/dialogs/schedule-processing-index-rebuild-dialog/schedule-processing-index-rebuild-dialog.component';
import { ScheduleProcessingIndexRebuildForObjectDialogComponent } from 'src/app/dialogs/schedule-processing-index-rebuild-for-object-dialog/schedule-processing-index-rebuild-for-object-dialog.component';
import { ScheduleRemoveLicenseDialogComponent } from 'src/app/dialogs/schedule-remove-license-dialog/schedule-remove-license-dialog.component';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { UIService } from 'src/app/services/ui.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { DeleteObjectsLowLevelDialogComponent } from 'src/app/dialogs/delete-objects-low-level-dialog/delete-objects-low-level-dialog.component';
import { ScheduleDeleteObjectsSmartComponent } from 'src/app/dialogs/schedule-delete-objects-smart/schedule-delete-objects-smart.component';

@Component({
  selector: 'app-repository',
  templateUrl: './repository.component.html',
  styleUrls: ['./repository.component.scss']
})
export class RepositoryComponent implements OnInit {
  view: string;

  constructor(
    private dialog: MatDialog,
    private ui: UIService,
    private adminApi: AdminApiService,
    private local: LocalStorageService
  ) { }

  ngOnInit() {
    this.view = this.local.getStringProperty('repository.view', 'repositoryManagement');
  }

  openscheduleProcessingIndexRebuildDialog() {
    const dialogRef = this.dialog.open(ScheduleProcessingIndexRebuildDialogComponent, {
      width: '600px',
      panelClass: 'app-schedule-processing-index-rebuild-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar('snackbar.error.scheduleProcessingIndexRebuild');
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else {
        this.ui.showInfoSnackBar('snackbar.success.scheduleProcessingIndexRebuild');
      }
    });
  };

  openscheduleProcessingIndexRebuildForPidDialog() {
    const dialogRef = this.dialog.open(ScheduleProcessingIndexRebuildForObjectDialogComponent, {
      width: '600px',
      panelClass: 'app-schedule-processing-index-for-object-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar('snackbar.error.scheduleProcessingIndexRebuildForObject');
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else {
        this.ui.showInfoSnackBar('snackbar.success.scheduleProcessingIndexRebuildForObject');
      }
    });
  };

  openScheduleImportFoxmlDialog() {
    const dialogRef = this.dialog.open(ScheduleImportFoxmlDialogComponent, {
      width: '600px',
      panelClass: 'app-schedule-import-foxml-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar("Nepodařilo se naplánovat proces Import FOXML")
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else {
        this.ui.showInfoSnackBar(`Proces Import FOXML byl naplánován`);
      }
    });
  }

  openChangePolicyDialog() {
    const dialogRef = this.dialog.open(ScheduleChangePolicyByPidDialogComponent, {
      width: '600px',
      panelClass: 'app-schedule-change-policy-by-pid-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar('snackbar.error.scheduleChangePolicyByPid')
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else if (result == 1) {
        this.ui.showInfoSnackBar('snackbar.success.scheduleChangePolicyByPid.1');
      } else if (result == 2 || result == 3 || result == 4) {
        this.ui.showInfoSnackBar('snackbar.success.scheduleChangePolicyByPid.2-4', {value: result});
      } else {
        this.ui.showInfoSnackBar('snackbar.success.scheduleChangePolicyByPid.more', {value: result});
      }
    });
  };

  openScheduleImportNdkDialog() {
    const dialogRef = this.dialog.open(ScheduleImportNdkDialogComponent, {
      width: '600px',
      panelClass: 'app-schedule-import-Ndk-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar("Nepodařilo se naplánovat proces Import NDK METS")
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else {
        this.ui.showInfoSnackBar(`Proces Import NDK METS byl naplánován`);
      }
    });
  }

  openAddLicenceDialog() {
    const dialogRef = this.dialog.open(ScheduleAddLicenseDialogComponent, {
      width: '600px',
      panelClass: 'app-schedule-add-licencse-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar('snackbar.error.scheduleAddLicense')
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else {
        this.ui.showInfoSnackBar('snackbar.success.scheduleAddLicense');
      }
    });
  }

  openRemoveLicenceDialog() {
    const dialogRef = this.dialog.open(ScheduleRemoveLicenseDialogComponent, {
      width: '600px',
      panelClass: 'app-schedule-remove-license--dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar('snackbar.error.scheduleRemoveLicense')
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else {
        this.ui.showInfoSnackBar('snackbar.success.scheduleRemoveLicense');
      }
    });
  }


  todo() {
    console.log('TODO: implement');
  }


  openNkpLogyDialog() {
    const dialogRef = this.dialog.open(GenerateNkpLogsDialogComponent, {
      width: '600px',
      panelClass: 'app-generate-nkp-logs-dialog'
    });
  }

  openDeleteStatisticsDialog() {
    const dialogRef = this.dialog.open(DeleteStatisticsDialogComponent, {
      width: '600px',
      panelClass: 'app-delete-statistics-dialog'
    });
  }

  changeView(view: string) {
    this.view = view;
    this.local.setStringProperty('repository.view', view);
  }


  openDeleteObjectsLowLevelDialog() {
    const dialogRef = this.dialog.open(DeleteObjectsLowLevelDialogComponent, {
      width: '600px',
      panelClass: 'app-delete-objects-low-level-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar('snackbar.error.deleteObjectsLowLevel')
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else if (result == 1) {
        this.ui.showInfoSnackBar('snackbar.success.deleteObjectsLowLevel.1');
      } else if (result == 2 || result == 3 || result == 4) {
        this.ui.showInfoSnackBar('snackbar.success.deleteObjectsLowLevel.2-4', {value: result});
      } else {
        this.ui.showInfoSnackBar('snackbar.success.deleteObjectsLowLevel.more', {value: result});
      }
    });
  }

  openScheduleDeleteObjectsSmartDialog() {
    const dialogRef = this.dialog.open(ScheduleDeleteObjectsSmartComponent, {
      width: '600px',
      panelClass: 'app-schedule-delete-objects-smart'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar('snackbar.error.deleteObjectsSmart')
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else if (result == 1) {
        this.ui.showInfoSnackBar('snackbar.success.deleteObjectsSmart.1');
      } else if (result == 2 || result == 3 || result == 4) {
        this.ui.showInfoSnackBar('snackbar.success.deleteObjectsSmart.2-4', {value: result});
      } else {
        this.ui.showInfoSnackBar('snackbar.success.deleteObjectsSmart.more', {value: result});
      }
    });
  }


}
