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
import { AuthService } from 'src/app/services/auth.service';
import { AppSettings } from 'src/app/services/app-settings';


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

  // specificke akce spojene s objektem
  specificAuthorizedActions = [];
  // specificke akce pro kolekce
  collectionActions:Map<string,string[]> = new Map();

  proarcServers = this.settings.proarc;
  selectedProarcServer: string;


  constructor(
    private authApi: AuthService,
    private local: LocalStorageService,
    private router: Router,
    private route: ActivatedRoute,
    private adminApi: AdminApiService,
    private dialog: MatDialog,
    private ui: UIService,
    private collectionsService: CollectionsService,
    private clientApi: ClientApiService,
    private clipboard: Clipboard,
    public settings: AppSettings
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.pid = params['pid'];
      //this.title = this.pid;
      if (!!this.pid) {

        this.authApi.loadAuthorizedSpecificActions(this.pid, (res:number)=>{
          this.specificAuthorizedActions =  this.authApi.authorizedSpecificActions[this.pid];

          let indexEnabled  = this.specificAuthorizedActions.indexOf('a_index') >=0;
          let rightsEnabled  = this.specificAuthorizedActions.indexOf('a_rights_edit') >=0;
          let accessibilityEnabled  = this.specificAuthorizedActions.indexOf('a_set_accessibility') >=0;
          let rebuildProcessingIndexEnabled  = this.specificAuthorizedActions.indexOf('a_rebuild_processing_index') >=0;
          let deleteEEnabled  = this.specificAuthorizedActions.indexOf('a_delete') >=0;
          let collectionEditEnabled  = this.specificAuthorizedActions.indexOf('a_collections_edit') >=0;

          if (indexEnabled || rightsEnabled || accessibilityEnabled || rebuildProcessingIndexEnabled || deleteEEnabled || collectionEditEnabled) {
            this.loadData(); 
          } else {
            this.errorMessage = this.ui.getTranslation('alert.object.uuidValidation403');
          }
        });
      }
    });
  }

  

  loadData() {
    this.checkingPid = true;
    this.errorMessage = undefined;
    this.inputPid = this.pid;
    this.adminApi.checkObject(this.pid).subscribe(result => {
      this.pidIsCorrect = true;
      this.view = this.local.getStringProperty('object.view', 'actions');
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


  allowCollectionEdit(pid) {
    if (this.collectionActions.has(pid)) {
      if (this.collectionActions.get(pid).includes('a_collections_edit')) {
        return true;
      }
    }
    return false;
  }


  loadSolrData() {
    this.title = undefined;
    this.clientApi.getObjectByPidFromIndex(this.pid).subscribe(result => {
      this.title = result['title.search'];
    })
  }

  loadCollections() {
    // 
    //if (this.specificAuthorizedActions.indexOf('a_collections_edit')>=0) {

      this.loadingCollections = true;
      this.superCollections = undefined;
      this.collectionsService.getCollectionsContainingItem(this.pid).subscribe((data: [collections: Collection[], size: number]) => {
        this.superCollections = data[0];

        this.authApi.getPidsAuthorizedActions(this.superCollections.map(c=> c['id']), null).subscribe((d:any) => {
          Object.keys(d).forEach((k)=> {
            let actions = d[k].map((v)=> v.code);
            this.collectionActions.set(k, actions);
          });
        });
  
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
    //}
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
    // to delete after test
    // this.router.navigate(['/object/' + view + '/', this.inputPid]);
    this.router.navigate(['/object/' + this.inputPid + '/' + view]);
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
    // to delete after test
    //this.router.navigate(['/object/actions/', this.inputPid]);
    this.router.navigate(['/object/' + this.inputPid + '/actions']);
    this.local.setStringProperty('object.view', 'actions');
  }

  deleteObjectLowLevel() {
    const data: SimpleDialogData = {
      title: this.ui.getTranslation('modal.deleteObjectLowLevel.title'),
      message: this.ui.getTranslation('modal.deleteObjectLowLevel.message'),
      btn1: {
        label: this.ui.getTranslation('button.delete'),
        value: 'yes',
        color: 'warn'
      },
      btn2: {
        label: this.ui.getTranslation('button.cancel'),
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
          this.ui.showInfoSnackBar('snackbar.success.deleteObjectLowLevel');
          this.router.navigate(['/object']);
        }, (error) => {
          console.log(error);
          this.ui.showErrorSnackBar('snackbar.error.deleteObjectLowLevel')
        });
      }
    });
  }

  deleteObjectSmart() {
    const data: SimpleDialogData = {
      title: this.ui.getTranslation('modal.deleteObjectSmart.title'),
      message: this.ui.getTranslation('modal.deleteObjectSmart.message'),
      btn1: {
        label: this.ui.getTranslation('button.schedule'),
        value: 'yes',
        color: 'warn'
      },
      btn2: {
        label: this.ui.getTranslation('button.cancel'),
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
          this.ui.showInfoSnackBar("snackbar.success.deleteObjectSmart");
          //this.router.navigate(['/object']);
        }, (error) => {
          console.log(error);
          this.ui.showErrorSnackBar("snackbar.error.deleteObjectSmart");
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
        this.ui.showInfoSnackBar(`Indexace byla naplánována`);
      } else if (result === 'error') {
        this.ui.showErrorSnackBar("Nepodařilo se naplánovat indexaci")
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
        specificAuthorizedActions: this.specificAuthorizedActions

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
        this.ui.showErrorSnackBar('snackbar.error.scheduleProcessingIndexRebuildForObject')
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else {
        this.ui.showInfoSnackBar('snackbar.success.scheduleProcessingIndexRebuildForObject');
      }
    });
  }

  getCurrentRoute(type: string, path: string = null) {
    if (type === 'string') {
      return this.router.url.replace(path, '');
    } else {
      return this.router.url;
    }
  }

  copyTextToClipboard(val: string) {
    this.clipboard.copy(val);
    this.ui.showInfoSnackBar('snackbar.success.copyToClipboard');
  }

  removeItemFromAnotherCollection(superCollection, collection, event) {
    this.onRemoveItemFromCollection(superCollection.id, superCollection.getName(), collection['id'], collection.getName());
    event.preventDefault(); 
    event.stopPropagation();
  }

  setRouterLink(path: string = null, id: string,  viewProperty: string = null, viewValue: string = null) {
    this.router.navigate([path, id]);
    this.local.setStringProperty(viewProperty + '.view', viewValue);
    console.log(id);
  }

  openObjectInProarc(server: string) {
    window.open(server + '/kramerius/' + this.inputPid, "_blank");
  }
}


