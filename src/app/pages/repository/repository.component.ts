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
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { ScheduleSyncWithSdnntComponent } from 'src/app/dialogs/schedule-sync-with-sdnnt/schedule-sync-with-sdnnt.component';
import { ScheduleStartTheSdnntReviewProcessComponent } from 'src/app/dialogs/schedule-start-the-sdnnt-review-process/schedule-start-the-sdnnt-review-process.component';
import { ScheduleChangeFlagOnLicenseDialogComponent } from 'src/app/dialogs/schedule-change-flag-on-license-dialog/schedule-change-flag-on-license-dialog.component';
import { ScheduleRemoveTheVisibilityFlagDialogComponent } from 'src/app/dialogs/schedule-remove-the-visibility-flag-dialog/schedule-remove-the-visibility-flag-dialog.component';
import { AppSettings } from 'src/app/services/app-settings';
import { ScheduleReHarvestSpecificPidsDialogComponent } from 'src/app/dialogs/schedule-re-harvest-specific-pids-dialog/schedule-re-harvest-specific-pids-dialog.component';
import { ScheduleMigrateCollectionsDialogComponent } from 'src/app/dialogs/schedule-migrate-collections-dialog/schedule-migrate-collections-dialog.component';

@Component({
  selector: 'app-repository',
  templateUrl: './repository.component.html',
  styleUrls: ['./repository.component.scss']
})
export class RepositoryComponent implements OnInit {
  view: string;

  // // to test accesibility
  notAllowed: boolean = true;

  constructor(
    private dialog: MatDialog,
    private ui: UIService,
    private adminApi: AdminApiService,
    private auth: AuthService,
    private local: LocalStorageService,
    private router: Router,
    public settings: AppSettings
  ) { }

  ngOnInit() {
    //this.view = this.local.getStringProperty('repository.view', 'repositoryManagement');
    this.view = this.router.url.replace('/repository/', '');
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

  allowedGlobalAction(name:string) {
    if (this.auth.authorizedGlobalActions) {
      let retval = this.auth.authorizedGlobalActions.indexOf(name) >= 0;
      return retval;
    } else return false;
  }

  /* to delete after test openNkpLogyDialog() {
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
  } */

  changeView(view: string) {
    this.view = view;
    this.local.setStringProperty('repository.view', view);
    this.router.navigate(['/repository/', view]);
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


  openScheduleSyncWithSdnntDialog() {
    const dialogRef = this.dialog.open(ScheduleSyncWithSdnntComponent, {
      width: '1200px',
      panelClass: 'app-schedule-sync-with-sdnnt'
    });
  }

  openScheduleStartTheSdnntReviewProcessDialog() {
    const dialogRef = this.dialog.open(ScheduleStartTheSdnntReviewProcessComponent, {
      width: '600px',
      panelClass: 'app-schedule-start-the-sdnnt-review-process'
    });
  }

  openScheduleChangeFlagOnLicenseDialog() {
    const dialogRef = this.dialog.open(ScheduleChangeFlagOnLicenseDialogComponent, {
      width: '600px',
      panelClass: 'app-schedule-change-flag-on-license-dialog'
    });
  }

  openRemoveTheVisibilityFlagDialog() {
    const dialogRef = this.dialog.open(ScheduleRemoveTheVisibilityFlagDialogComponent, {
      width: '600px',
      panelClass: 'app-schedule-remove-the-visibility-flag-dialog'
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
    }})
  }

  openScheduledReHarvestSpecificPidsDialog() {
    const dialogRef = this.dialog.open(ScheduleReHarvestSpecificPidsDialogComponent, {
      width: '600px',
      panelClass: 'app-schedule-re-harvest-specific-pids-dialog'
    });
  }

  openScheduleMigrateCollectionsDialog() {
    const dialogRef = this.dialog.open(ScheduleMigrateCollectionsDialogComponent, {
      width: '600px',
      panelClass: 'app-schedule-migrate-collections-dialog'
    });
  }

}
