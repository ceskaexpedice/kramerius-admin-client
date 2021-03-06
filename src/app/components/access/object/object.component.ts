import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AddItemToCollectionDialogComponent } from 'src/app/dialogs/add-item-to-collection-dialog/add-item-to-collection-dialog.component';
import { ScheduleAddLicenseDialogComponent } from 'src/app/dialogs/schedule-add-license-dialog/schedule-add-license-dialog.component';
import { ScheduleChangePolicyByPidDialogComponent } from 'src/app/dialogs/schedule-change-policy-by-pid-dialog/schedule-change-policy-by-pid-dialog.component';
import { ScheduleIndexationByPidDialogComponent } from 'src/app/dialogs/schedule-indexation-by-pid-dialog/schedule-indexation-by-pid-dialog.component';
import { ScheduleProcessingIndexRebuildForObjectDialogComponent } from 'src/app/dialogs/schedule-processing-index-rebuild-for-object-dialog/schedule-processing-index-rebuild-for-object-dialog.component';
import { ScheduleRemoveLicenseDialogComponent } from 'src/app/dialogs/schedule-remove-license-dialog/schedule-remove-license-dialog.component';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { Collection } from 'src/app/models/collection.model';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { ClientApiService } from 'src/app/services/client-api.service';
import { CollectionsService } from 'src/app/services/collections.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { UIService } from 'src/app/services/ui.service';
import { Clipboard } from '@angular/cdk/clipboard';


@Component({
  templateUrl: './object.component.html',
  styleUrls: ['./object.component.scss']
})
export class ObjectComponent implements OnInit {

  view: string;
  pid: string;
  inputPid: string;
  pidIsCorrect = false;
  errorMessage: string;
  title;
  collection: Collection;

  checkingPid = false;

  //tab collections
  loadingCollections = false;
  superCollections;

  //tab accessibility
  loadingLicenses = false;
  licenses;
  policy;

  constructor(
    private local: LocalStorageService,
    private router: Router,
    private route: ActivatedRoute,
    private adminApi: AdminApiService,
    private dialog: MatDialog,
    private ui: UIService,
    private collectionsService: CollectionsService,
    private clientApi: ClientApiService,
    private clipboard: Clipboard
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.pid = params['pid'];
      //this.title = this.pid;
      if (!!this.pid) {
        this.loadData();
      }
    });
  }

  loadData() {
    this.checkingPid = true;
    this.errorMessage = undefined;
    this.inputPid = this.pid;
    this.adminApi.checkObject(this.pid).subscribe(result => {
      this.pidIsCorrect = true;
      this.view = this.local.getStringProperty('object.view', 'accessibility');
      this.checkingPid = false;
      this.loadSolrData();
      this.loadCollections();
      this.loadLicenses();
    }, error => {
      this.pidIsCorrect = false;
      this.checkingPid = false;
      if (error.status == 400) {
        this.errorMessage = this.ui.getTranslation('alert.object.uuidValidation400');
      } else if (error.status == 404) {
        this.errorMessage = this.ui.getTranslation('alert.object.uuidValidation404');
      } else if (error.status == 403) {
        this.errorMessage = this.ui.getTranslation('alert.object.uuidValidation403');
      } else {
        this.errorMessage = this.ui.getTranslation('alert.object.uuidValidationElse', { value1: error.status, value2: error.message });
        console.log(error);
      }
    })
  }

  loadSolrData() {
    this.title = undefined;
    this.clientApi.getObjectByPidFromIndex(this.pid).subscribe(result => {
      this.title = result['title.search'];
    })
  }

  loadCollections() {
    this.loadingCollections = true;
    this.superCollections = undefined;
    this.collectionsService.getCollectionsContainingItem(this.pid).subscribe((data: [collections: Collection[], size: number]) => {
      this.superCollections = data[0];
      this.loadingCollections = false;
    }, (error) => {
      console.log(error);
      this.loadingCollections = false;
      this.ui.showErrorSnackBar("Nepoda??il na????st seznam sb??rek obsahuj??ch tento objekt")
    });

    // PEDRO -> chybel popisek, vzal jsem z collection.component.ts
    this.collectionsService.getCollection(this.pid).subscribe((collection: Collection) => {
      this.collection = collection;
    }, (error) => {
      console.log(error);
      this.ui.showErrorSnackBar("Sb??rku se nepoda??ilo na????st")
    });
  }

  loadLicenses() {
    this.loadingLicenses = true;
    this.licenses = undefined;
    this.policy = undefined;
    this.adminApi.getLicensesOfObject(this.pid).subscribe(data => {
      this.licenses = data['licenses']
      this.policy = data['policy'];
      this.loadingLicenses = false;
    }, (error) => {
      console.log(error);
      this.loadingLicenses = false;
      this.ui.showErrorSnackBar("Nepoda??il na????st seznam licence tohoto objektu")
    });
  }

  correctPid() {
    return this.pid && this.pidIsCorrect;
  }

  changeView(view: string) {
    this.view = view;
    this.local.setStringProperty('object.view', view);
  }

  assignUuid() {
    this.errorMessage = undefined;
    if (!this.inputPid) {
      return;
    }
    if (!this.inputPid.startsWith('uuid:')) {
      this.errorMessage = this.ui.getTranslation('alert.object.uuidValidation400');
      return;
    }
    this.router.navigate(['/', 'object', this.inputPid]);
  }

  getCurrentRoute(type: string) {
    if (type === 'string') {
      return this.router.url.replace('/object/', '');
    } else {
      return this.router.url;
    }
  }

  deleteObjectFromRepo() {
    const data: SimpleDialogData = {
      title: this.ui.getTranslation('modal.deleteObjectFromRepo.title'),
      message: this.ui.getTranslation('modal.deleteObjectFromRepo.message'),
      btn1: {
        label: this.ui.getTranslation('button.yes'),
        value: 'yes',
        color: 'warn'
      },
      btn2: {
        label: this.ui.getTranslation('button.no'),
        value: 'no',
        color: 'light'
      }
    };
    const dialogRef = this.dialog.open(SimpleDialogComponent, {
      data: data,
      width: '600px',
      panelClass: 'app-simple-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.adminApi.deleteObject(this.pid).subscribe(result => {
          this.ui.showInfoSnackBar('snackbar.success.deleteObjectFromRepo');
          this.router.navigate(['/object']);
        }, (error) => {
          console.log(error);
          this.ui.showErrorSnackBar('snackbar.error.deleteObjectFromRepo')
        });
      }
    });
  }

  deleteObjectTreeWithProcess() {
    const data: SimpleDialogData = {
      title: this.ui.getTranslation('modal.deleteObjectTreeWithProcess.title'),
      message: this.ui.getTranslation('modal.deleteObjectTreeWithProcess.message'),
      btn1: {
        label: this.ui.getTranslation('button.yes'),
        value: 'yes',
        color: 'warn'
      },
      btn2: {
        label: this.ui.getTranslation('button.no'),
        value: 'no',
        color: 'light'
      }
    };
    const dialogRef = this.dialog.open(SimpleDialogComponent, {
      data: data,
      width: '600px',
      panelClass: 'app-simple-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(this.title)
      if (result === 'yes') {
        this.adminApi.scheduleProcess({
          defid: 'delete_tree',
          params: {
            pid: this.pid,
            title: this.title,
          }
        }).subscribe(result => {
          this.ui.showInfoSnackBar("snackbar.success.deleteObjectTreeWithProcess");
          //this.router.navigate(['/object']);
        }, (error) => {
          console.log(error);
          this.ui.showErrorSnackBar("snackbar.error.deleteObjectTreeWithProcess");
        });
      }
    });

  }

  indexObjectWithProcess() {
    const dialogRef = this.dialog.open(ScheduleIndexationByPidDialogComponent, {
      data: {
        pid: this.pid,
        title: this.title
      },
      width: '600px',
      panelClass: 'app-schedule-indexation-by-pid-dialog'
    });
    /* commented because same calling bellow
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'scheduled') {
        this.ui.showInfoSnackBar(`Indexace byla napl??nov??na`);
      } else if (result === 'error') {
        this.ui.showErrorSnackBar("Nepoda??ilo se napl??novat indexaci")
      }
    }); */
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar('snackbar.error.indexObjectWithProces')
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else if (result == 1) {
        this.ui.showInfoSnackBar('snackbar.success.indexObjectWithProces.1');
      } else if (result == 2 || result == 3 || result == 4) {
        this.ui.showInfoSnackBar('snackbar.success.indexObjectWithProces.2-4', {value: result});
      } else {
        this.ui.showInfoSnackBar('snackbar.success.indexObjectWithProces.more', {value: result});
      }
    });
  };

  getThumb(uuid: string): string {
    return this.clientApi.getThumb(uuid);
  }

  getCollectionName(collection: Collection) {
    if (!!collection) {
      return !!collection.name_cze ? collection.name_cze : collection.name_eng;
    }
  }

  getCollectionDescription(collection: Collection) {
    //console.log(collection)
    if (!!collection) {
      return !!collection.description_cze ? collection.description_cze : collection.description_eng;
    }
  }

  onRemoveItemFromCollection(collectionPid: string, collectionName: string, itemPid: string, itemName) {
    const data: SimpleDialogData = {
      title: this.ui.getTranslation('modal.removeFromThisCollection.title'),
      message: this.ui.getTranslation('modal.removeFromThisCollection.message', { value1: itemName, value2: collectionName }) + '?',
      btn1: {
        label: this.ui.getTranslation('button.yes'),
        value: 'yes',
        color: 'warn'
      },
      btn2: {
        label: this.ui.getTranslation('button.no'),
        value: 'no',
        color: 'light'
      }
    };
    const dialogRef = this.dialog.open(SimpleDialogComponent, {
      data: data,
      width: '600px',
      panelClass: 'app-simple-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.collectionsService.removeItemFromCollection(collectionPid, itemPid).subscribe(() => {
          this.ui.showInfoSnackBar(`snackbar.success.removeFromThisCollection`);
          this.loadCollections();
        }, (error) => {
          console.log(error);
          this.ui.showErrorSnackBar(`snackbar.error.removeFromThisCollection`)
        });
      }
    });
  }

  onAddThisToACollection() {
    const dialogRef = this.dialog.open(AddItemToCollectionDialogComponent, {
      data: {
        pid: this.pid,
        title: this.title,
        isCollection: false,
      },
      width: '600px',
      panelClass: 'app-add-item-to-collection'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'added') {
        this.ui.showInfoSnackBar(`snackbar.success.addThisToSuperCollection`);
        this.loadCollections();
      } else if (result === 'error') {
        this.ui.showErrorSnackBar("snackbar.error.addThisToSuperCollection")
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      }
    });
  }

  onAddLicense() {
    const dialogRef = this.dialog.open(ScheduleAddLicenseDialogComponent, {
      data: {
        pid: this.pid,
        title: this.title,
        licenses: this.licenses,
      },
      width: '600px',
      panelClass: 'app-schedule-add-licencse-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar("snackbar.error.scheduleAddLicense")
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else {
        this.ui.showInfoSnackBar(`snackbar.success.scheduleAddLicense`);
      }
    });
  }

  onRemoveLicense(licence: String) {
    const dialogRef = this.dialog.open(ScheduleRemoveLicenseDialogComponent, {
      data: {
        pid: this.pid,
        title: this.title,
        licenses: this.licenses,
        license: licence
      },
      width: '600px',
      panelClass: 'app-schedule-remove-license--dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar("snackbar.error.scheduleRemoveLicense")
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else {
        this.ui.showInfoSnackBar(`snackbar.success.scheduleRemoveLicense`);
      }
    });
  }

  onChangePolicy() {
    const dialogRef = this.dialog.open(ScheduleChangePolicyByPidDialogComponent, {
      data: {
        pid: this.pid,
        title: this.title,
        policy: this.policy == 'private' ? 'PUBLIC' : 'PRIVATE'
      },
      width: '600px',
      panelClass: 'app-schedule-change-policy-by-pid-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar("snackbar.error.visibilityChange")
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else if (result == 1) {
        this.ui.showInfoSnackBar(`snackbar.success.visibilityChange.1`);
      } else if (result == 2 || result == 3 || result == 4) {
        this.ui.showInfoSnackBar(`snackbar.success.visibilityChange.2-4`, { value: result });
      } else {
        this.ui.showInfoSnackBar(`snackbar.success.visibilityChange.more`, { value: result });
      }
    });
  }

  rebuildProcessingIndexForObject() {
    const dialogRef = this.dialog.open(ScheduleProcessingIndexRebuildForObjectDialogComponent, {
      data: {
        pid: this.pid,
        title: this.title
      },
      width: '600px',
      panelClass: 'app-schedule-processing-index-for-object-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar('snackbar.error.rebuildProcessingIndexForObject')
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else {
        this.ui.showInfoSnackBar('snackbar.success.rebuildProcessingIndexForObject');
      }
    });
  }

  copyTextToClipboard(val: string) {
    this.clipboard.copy(val);
    this.ui.showInfoSnackBar('snackbar.success.copyToClipboard');
  }

}


