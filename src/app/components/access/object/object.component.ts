import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ScheduleIndexationByPidDialogComponent } from 'src/app/dialogs/schedule-indexation-by-pid-dialog/schedule-indexation-by-pid-dialog.component';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { Collection } from 'src/app/models/collection.model';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { ClientApiService } from 'src/app/services/client-api.service';
import { CollectionsService } from 'src/app/services/collections.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { UIService } from 'src/app/services/ui.service';


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
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.pid = params['pid'];
      this.title = this.pid;
      if (!!this.pid) {
        this.loadData();
      }
    });
  }

  loadData() {
    this.checkingPid = true;
    this.errorMessage = undefined;
    this.inputPid = this.pid;
    //TODO: optimalizace: nacist zvlast RELS-EXT a MODS, takhle to taha zbytcne moc data (binarni datastreamy, verze RELS-EXT apod.)
    this.adminApi.checkObject(this.pid).subscribe(result => {
      this.pidIsCorrect = true;
      this.view = this.local.getStringProperty('object.view', 'accessibility');
      this.checkingPid = false;
      this.loadCollections();
      this.loadLicenses();
    }, error => {
      this.pidIsCorrect = false;
      this.checkingPid = false;
      if (error.status == 400) {
        this.errorMessage = `neplatné UUID`;
      } else if (error.status == 404) {
        this.errorMessage = `objekt nenalezen`;
      } else if (error.status == 403) {
        this.errorMessage = `nedostatečná přístupová práva`;
      } else {
        this.errorMessage = `chyba čtení z repozitáře: ${error.status}: ${error.message}`;
        console.log(error);
      }
    })
  }

  loadCollections() {
    this.loadingCollections = true;
    this.superCollections = undefined;
    this.collectionsService.getCollectionsContainingItem(this.pid).subscribe((data: [collections: Collection[], size: number]) => {
      this.loadingCollections = false;
      this.superCollections = data[0];
    }, (error) => {
      console.log(error);
      this.loadingCollections = false;
      this.ui.showErrorSnackBar("Nepodařil načíst seznam sbírek obsahujích tento objekt")
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
      console.log(data);
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
    if (!this.inputPid) {
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
        //TODO: title
        //title: 'BLA' 
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
          //this.loadData(this.pid);
          this.loadCollections();
          // (async () => {
          //   await this.delay(0);
          //   this.loadData(this.collection.id);
          // })();
        }, (error) => {
          console.log(error);
          this.ui.showErrorSnackBar("Položku se nepodařilo odebrat ze sbírky")
        });
      }
    });
  }

  onAddThisToSuperCollection() {
    //TODO: implement
  }

  onAddLicense() {
    console.log('TODO: add license')
  }

  onRemoveLicense(licence: String) {
    console.log('TODO: remove license ' + licence)
  }

  onChangePolicy() {
    console.log('TODO: change policy')
  }

}


