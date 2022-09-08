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
import { AuthService } from 'src/app/services/auth.service';

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

  items: any[]; //polozky ve sbirce
  superCollections: Collection[] = []; //sbirky obsahujici tuto sbirku

  collectionActions:Map<string,string[]> = new Map();


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ui: UIService,
    private dialog: MatDialog,
    private clientApi: ClientApiService,
    private collectionsService: CollectionsService,
    private local: LocalStorageService,
    private clipboard: Clipboard,
    private auth:AuthService) {
  }

  ngOnInit() {
    this.state = 'loading';
    this.route.params.subscribe(params => {
      this.loadData(params['id']);
    })


  }

  loadData(collectionId: string) {
    this.state = 'loading';
    //console.log('loading data for ' + collectionId)
    this.collectionsService.getCollection(collectionId).subscribe((collection: Collection) => {
      this.collection = collection;
      this.clientApi.getCollectionChildren(collectionId).subscribe((res) => {
        this.items = res.filter(item => this.collection.items.includes(item['pid']))
        //this.view = 'detail';
        this.view = this.local.getStringProperty('collection.view', 'detail');
        this.state = 'success';
        // deti 
        this.auth.getPidsAuthorizedActions(this.items.map(c=> c['pid'])).subscribe((d:any) => {
          Object.keys(d).forEach((k)=> {
            let actions = d[k].map((v)=> v.code);
            this.collectionActions.set(k, actions);
          });
        });
      })


    }, (error) => {
      console.log(error);
      this.ui.showErrorSnackBar("snackbar.error.theCollectionCouldNotBeLoaded");
    });
    this.collectionsService.getCollectionsContainingItem(collectionId).subscribe((data: [collections: Collection[], size: number]) => {
      //console.log(data)
      this.superCollections = data[0];

      this.auth.getPidsAuthorizedActions(this.superCollections.map(c=> c['id'])).subscribe((d:any) => {
        Object.keys(d).forEach((k)=> {
          let actions = d[k].map((v)=> v.code);
          this.collectionActions.set(k, actions);
        });
      });


    }, (error) => {
      console.log(error);
      this.ui.showErrorSnackBar("snackbar.error.failedToLoadListOfCollectionsContainingThisCollection");
    });
  }

  //TODO: remove after not needed
  getThumb(uuid: string): string {
    return this.clientApi.getThumb(uuid);
  }

  changeView(view: string) {
    this.view = view;
    this.local.setStringProperty('collection.view', view);
  }

  onUpdated() {
    this.loadData(this.collection.id);
  }

  onDelete() {
    if (!this.collection) {
      return;
    }
    const data: SimpleDialogData = {
      title: this.ui.getTranslation('modal.removeCollection.title'),
      message: this.ui.getTranslation('modal.removeCollection.message') + '?',
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

  onAddItemsToThisCollection() {
    const dialogRef = this.dialog.open(AddItemsToCollectionDialogComponent, {
      data: this.collection,
      width: '600px',
      panelClass: 'app-add-items-to-collection'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'added') {
        this.loadData(this.collection.id);
      }
    });
  }

  onAddThisToSuperCollection() {
    const dialogRef = this.dialog.open(AddItemToCollectionDialogComponent, {
      data: {
        pid: this.collection.id,
        title: this.collection.getName(),
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