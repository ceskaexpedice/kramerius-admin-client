import { Component, OnInit } from '@angular/core';
import { Collection } from 'src/app/models/collection.model';
import { ActivatedRoute, Router } from '@angular/router';
import { UIService } from 'src/app/services/ui.service';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { MatDialog } from '@angular/material/dialog';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { CollectionsService } from 'src/app/services/collections.service';
import { ClientApiService } from 'src/app/services/client-api.service';
import { AddItemsToCollectionDialogComponent } from 'src/app/dialogs/add-items-to-collection-dialog/add-items-to-collection-dialog.component';
import { AddItemToCollectionDialogComponent } from 'src/app/dialogs/add-item-to-collection-dialog/add-item-to-collection-dialog.component';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss']
})
export class CollectionComponent implements OnInit {

  collection: Collection;
  state = 'none';
  availableCollections: any[];
  view: string;

  items: any[];

  superCollections: Collection[] = []; //sbirky obsahujici tuto sbirku

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ui: UIService,
    private dialog: MatDialog,
    private clientApi: ClientApiService,
    private collectionsService: CollectionsService,
    private local: LocalStorageService,
    private clipboard: Clipboard) {
  }

  ngOnInit() {
    this.state = 'loading';
    this.route.params.subscribe(params => {
      this.loadData(params['id']);
    })
  }

  loadData(collectionId: string) {
    //console.log('loading data for ' + collectionId)
    this.collectionsService.getCollection(collectionId).subscribe((collection: Collection) => {
      this.collection = collection;
      this.clientApi.getCollectionChildren(collectionId).subscribe((res) => {
        this.items = res.filter(item => this.collection.items.includes(item['pid']))
        //this.view = 'detail';
        this.view = this.local.getStringProperty('collection.view', 'detail');
        this.state = 'success';
      })
    }, (error) => {
      console.log(error);
      this.ui.showErrorSnackBar("snackbar.error.theCollectionCouldNotBeLoaded");
    });
    this.collectionsService.getCollectionsContainingItem(collectionId).subscribe((data: [collections: Collection[], size: number]) => {
      //console.log(data)
      this.superCollections = data[0];
    }, (error) => {
      console.log(error);
      this.ui.showErrorSnackBar("snackbar.error.failedToLoadListOfCollectionsContainingThisCollection");
    });
  }

  getModel(model: string): string {
    switch (model) {
      case 'monograph': return 'Kniha'
      case 'periodical': return 'Periodikum'
      case 'page': return 'Stránka'
      case 'periodicalitem': return 'Číslo periodika'
      case 'periodicalvolume': return 'Ročník periodika'
      default: return model
    }
  }

  getName(item): string {
    let name = item['title.search'];
    if (item['date.str'] && ['page', 'periodicalitem', 'periodicalvolume'].indexOf(item['model']) >= 0) {
      name += ' / ' + item['date.str'];
    }
    return name;
  }

  getThumb(uuid: string): string {
    return this.clientApi.getThumb(uuid);
  }

  changeView(view: string) {
    this.view = view;
    this.local.setStringProperty('collection.view', view);
  }

  onUpdated() {
    this.state = 'loading';
    this.collectionsService.getCollection(this.collection.id).subscribe((collection: Collection) => {
      this.collection = collection;
      this.state = 'success';
      //this.changeView('detail');
    });
  }

  onDelete() {
    if (!this.collection) {
      return;
    }
    const data: SimpleDialogData = {
      title: "Smazání sbírky",
      message: "Opravdu chcete sbírku trvale smazat?",
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
    const dialogRef = this.dialog.open(SimpleDialogComponent, { data: data });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.collectionsService.deleteCollection(this.collection).subscribe(result => {
          this.ui.showInfoSnackBar("snackbar.success.theCollectionHasBeenRemoved");
          this.router.navigate(['/collections']);
        }, (error) => {
          console.log(error);
          this.ui.showErrorSnackBar("snackbar.error.collectionCouldNotBeDeleted");
        });
      }
    });
  }

 // tato metoda neni nikde pouzita, zakomentovano 
 /*  addThisToCollection(collection: { pid: string, 'title.search': string }) {
    console.log(collection);
    if (!this.collection) {
      return;
    }
    const data: SimpleDialogData = {
      title: "Smazání sbírky",
      message: `Opravdu chcete tuto sbírku přidat do sbírky "${collection['title.search']}"?`,
      btn1: {
        label: 'Ano',
        value: 'yes',
        color: 'warn'
      },
      btn2: {
        label: 'Ne',
        value: 'no',
        color: 'default'
      }
    };
    const dialogRef = this.dialog.open(SimpleDialogComponent, { data: data });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.collectionsService.addItemToCollection(collection.pid, this.collection.id).subscribe((res) => {
          console.log(res);
          this.ui.showInfoSnackBar(`Sbírka byla přidána do sbírky "${collection['title.search']}"`)
        }, error => {
          console.log(error);
          this.ui.showErrorSnackBar("Sbírku se nepodařilo přidat");
        });
      }
    });
  } */

  onRemoveItemFromCollection(collectionPid: string, collectionName: string, itemPid: string, itemName) {
    // TODO: i18n
    const data: SimpleDialogData = {
      title: this.ui.getTranslation('modal.removeFromThisCollection.title'),
      message: this.ui.getTranslation('modal.removeFromThisCollection.message', {value1: itemName, value2: collectionName}) + '?',
      btn1: {
        label: this.ui.getTranslation('desc.yes'),
        value: 'yes',
        color: 'warn'
      },
      btn2: {
        label: this.ui.getTranslation('desc.no'),
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
          this.loadData(this.collection.id);
          // (async () => {
          //   await this.delay(0);
          //   this.loadData(this.collection.id);
          // })();
        }, (error) => {
          console.log(error);
          this.ui.showErrorSnackBar("snackbar.error.removeFromThisCollection");
        });
      }
    });
  }

  onAddItemsToCollection() {
    const dialogRef = this.dialog.open(AddItemsToCollectionDialogComponent, {
      data: this.collection,
      width: '600px',
      panelClass: 'app-add-items-to-collection'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result == 'close') {
        this.loadData(this.collection.id);
        this.ui.showInfoSnackBar(`snackbar.success.addToTheCollection`);
      } else {
        this.ui.showErrorSnackBar("snackbar.error.addToTheCollection");
      }
    });
  }

  onAddThisToSuperCollection() {
    const dialogRef = this.dialog.open(AddItemToCollectionDialogComponent, {
      data: {
        pid: this.collection.id,
        title: this.getCollectionName(this.collection),
        isCollection: true
      },
      width: '600px',
      panelClass: 'app-add-item-to-collection'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'added') {
        this.ui.showInfoSnackBar(`snackbar.success.addThisCollectionToAnotherCollection`);
        this.loadData(this.collection.id)
      } else if (result === 'error') {
        this.ui.showErrorSnackBar("snackbar.error.addThisCollectionToAnotherCollection");
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      }
    });
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  loadCollections() {
    this.clientApi.getAvailableCollections(this.collection.id).subscribe((collections: any[]) => {
      this.availableCollections = collections.sort((a, b) => {
        return a['title.search'].localeCompare(b['title.search'])
      });
    });
  }

  filterCollections(items) {
    return items.filter(item => item['model'] == 'collection');
  }

  filterNonCollections(items) {
    return items.filter(item => item['model'] != 'collection');
  }

  getCollectionName(collection: Collection) {
    if (!!collection) {
      return !!collection.name_cze ? collection.name_cze : collection.name_eng;
    }
  }

  getCollectionDescription(collection: Collection) {
    if (!!collection) {
      return !!collection.description_cze ? collection.description_cze : collection.description_eng;
    }
  }

  getCurrentRoute(type: string) {
    if (type === 'string') {
      return this.router.url.replace('/collections/', '');
    } else {
      return this.router.url;
    }
  }

  copyTextToClipboard(val: string) {
    this.clipboard.copy(val);
    this.ui.showInfoSnackBar('snackbar.success.copyToClipboard');
  }

}