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
        this.errorMessage = this.ui.getTranslation('alert.object.invalidUuid');
      } else if (error.status == 404) {
        this.errorMessage = `Objekt nenalezen`;
      } else if (error.status == 403) {
        this.errorMessage = `Nedostatečná přístupová práva`;
      } else {
        this.errorMessage = `Chyba čtení z repozitáře: ${error.status}: ${error.message}`;
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
      this.ui.showErrorSnackBar("Nepodařil načíst seznam sbírek obsahujích tento objekt")
    });

    // PEDRO -> chybel popisek, vzal jsem z collection.component.ts
    this.collectionsService.getCollection(this.pid).subscribe((collection: Collection) => {
      this.collection = collection;
    }, (error) => {
      console.log(error);
      this.ui.showErrorSnackBar("Sbírku se nepodařilo načíst")
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
      this.ui.showErrorSnackBar("Nepodařil načíst seznam licence tohoto objektu")
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
    if(!this.inputPid.startsWith('uuid:')){
      this.errorMessage = this.ui.getTranslation('alert.object.invalidUuid');
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
      title: "Smazání objektu (nízkoúrovňové)",
      message: "Opravdu chcete objekt trvale smazat? Objekt bude smazán z repozitáře i vyhledávácího indexu. " +
        "Nebudou ale aktualizovány odkazy na tento objekt z jiných objektů, nebudou mazány ani další odkazované objekty.",
      btn1: {
        label: 'Ano',
        value: 'yes',
        color: 'warn'
      },
      btn2: {
        label: 'Ne',
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
          this.ui.showInfoSnackBar("Objekt byl smazán");
          this.router.navigate(['/object']);
        }, (error) => {
          console.log(error);
          this.ui.showErrorSnackBar("Objekt se nepodařilo smazat")
        });
      }
    });
  }

  deleteObjectTreeWithProcess() {
    //TODO: implement after process has been tested on backend
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
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'scheduled') {
        this.ui.showInfoSnackBar(`Indexace byla naplánována`);
      } else if (result === 'error') {
        this.ui.showErrorSnackBar("Nepodařilo se naplánovat indexaci")
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar("Nepodařilo se naplánovat proces(y) Indexace")
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else if (result == 1) {
        this.ui.showInfoSnackBar(`Proces Indexace byl naplánován`);
      } else if (result == 2 || result == 3 || result == 4) {
        this.ui.showInfoSnackBar(`Byly naplánovány ${result} procesy Indexace`);
      } else {
        this.ui.showInfoSnackBar(`Bylo naplánováno ${result} procesů Indexace`);
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
    // TODO: i18n
    const data: SimpleDialogData = {
      title: "Odebrání ze sbírky",
      message: `Opravdu chcete odebrat "${itemName}" ze sbírky "${collectionName}"?`,
      btn1: {
        label: 'Ano',
        value: 'yes',
        color: 'warn'
      },
      btn2: {
        label: 'Ne',
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
          this.ui.showInfoSnackBar(`Objekt byl odebrán ze sbírky`);
          this.loadCollections();
        }, (error) => {
          console.log(error);
          this.ui.showErrorSnackBar("Objekt se nepodařilo odebrat ze sbírky")
        });
      }
    });
  }

  onAddThisToSuperCollection() {
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
        this.ui.showInfoSnackBar(`Objekt byl přidán do sbírky`);
        this.loadCollections();
      } else if (result === 'error') {
        this.ui.showErrorSnackBar("Objekt se nepodařilo přidat do sbírky")
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
        this.ui.showErrorSnackBar("Nepodařilo se naplánovat proces Přidání licence")
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else {
        this.ui.showInfoSnackBar(`Proces Přidání licence byl naplánován`);
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
        this.ui.showErrorSnackBar("Nepodařilo se naplánovat proces Odebrání licence")
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else {
        this.ui.showInfoSnackBar(`Proces Odebrání licence byl naplánován`);
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
        this.ui.showErrorSnackBar("Nepodařilo se naplánovat proces Přebudování Processing indexu pro objekt")
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else {
        this.ui.showInfoSnackBar(`Proces Přebudování Processing indexu pro objekt byl naplánován`);
      }
    });
  }

  copyTextToClipboard(val: string) {
    this.clipboard.copy(val);
    this.ui.showInfoSnackBar('Text byl úspěšně zkopírován do schánky!');
  }

}


