import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DeleteStatisticsComponent } from 'src/app/dialogs/delete-statistics/delete-statistics.component';
import { NkpLogyComponent } from 'src/app/dialogs/nkp-logy/nkp-logy.component';
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
        this.ui.showErrorSnackBar("Nepodařilo se naplánovat proces Vybudování Processing indexu")
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else {
        this.ui.showInfoSnackBar(`Proces Vybudování Processing indexu byl naplánován`);
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
        this.ui.showErrorSnackBar("Nepodařilo se naplánovat proces Přebudování Processing indexu pro objekt")
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else {
        this.ui.showInfoSnackBar(`Proces Přebudování Processing indexu pro objekt byl naplánován`);
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
        this.ui.showErrorSnackBar("Nepodařilo se naplánovat proces(y) Změna viditelnosti")
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else if (result == 1) {
        this.ui.showInfoSnackBar(`Proces Změna viditelnosti byl naplánován`);
      } else if (result == 2 || result == 3 || result == 4) {
        this.ui.showInfoSnackBar(`Byly naplánovány ${result} procesy Změna viditelnosti`);
      } else {
        this.ui.showInfoSnackBar(`Bylo naplánováno ${result} procesů Změna viditelnosti`);
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
        this.ui.showErrorSnackBar("Nepodařilo se naplánovat proces Přidání licence")
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else {
        this.ui.showInfoSnackBar(`Proces Přidání licence byl naplánován`);
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
        this.ui.showErrorSnackBar("Nepodařilo se naplánovat proces Odebrání licence")
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else {
        this.ui.showInfoSnackBar(`Proces Odebrání licence byl naplánován`);
      }
    });
  }


  todo() {
    console.log('TODO: implement');
  }


  openNkpLogyDialog() {
    const dialogRef = this.dialog.open(NkpLogyComponent, {
      width: '600px',
      panelClass: 'app-nkp-logy-dialog'
    });
  }

  openDeleteStatisticsDialog() {
    const dialogRef = this.dialog.open(DeleteStatisticsComponent, {
      width: '600px',
      panelClass: 'app-nkp-logy-dialog'
    });
  }

  changeView(view: string) {
    this.view = view;
    this.local.setStringProperty('repository.view', view);
  }

  deleteObjectTreeWithProcess() {
    // todu
  }

  deleteObjectFromRepo() {
    // todo
  }


}
