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
import { DeleteCollectionDialogComponent } from 'src/app/dialogs/delete-collection-dialog/delete-collection-dialog.component';
import { DeleteSelectedItemsFromCollectionComponent } from 'src/app/dialogs/delete-selected-items-from-collection/delete-selected-items-from-collection.component';
import { SelectionModel } from '@angular/cdk/collections';
import { forkJoin } from 'rxjs';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { AppSettings } from 'src/app/services/app-settings';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss']
})
export class CollectionComponent implements OnInit {

  /** kolekce  */
  collection: Collection;
  state = 'none';
  availableCollections: any[];
  view: string;

  /** vsechny polozky ve sbirce  */
  items: any[] = []; 
  /** orderings  */
  orderings: any[] = [];

  superCollections: Collection[] = []; //sbirky obsahujici tuto sbirku

  collectionActions:Map<string,string[]> = new Map();

  collectionId: string;

  selectedAllCollections: boolean = false;

  public isItemChildDraged: boolean;

  // item selection model 
  public selection = new SelectionModel<any>(true, []);

  public languages = this.appSettings.languages;
  public langSelected: string = 'cs';




  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ui: UIService,
    private dialog: MatDialog,
    private clientApi: ClientApiService,
    private collectionsService: CollectionsService,
    private local: LocalStorageService,
    private clipboard: Clipboard,
    private auth:AuthService,
    private adminApi: AdminApiService,
    public appSettings: AppSettings
    ) {
  }

  ngOnInit() {
    this.state = 'loading';
    this.route.params.subscribe(params => {
      this.loadData(params['id']);
      this.collectionId = params['id'];
    })
  }

  loadData(collectionId: string) {
    this.state = 'loading';
    //console.log('loading data for ' + collectionId)
    this.collectionsService.getCollection(collectionId).subscribe((collection: Collection) => {
      this.collection = collection;
      //this.clientApi
      
      this.clientApi.getStructure(collectionId).subscribe((response)=> {
        let children = response['children'];

        let fosterChildren = children['foster'].map(obj=> obj['pid']);
        
        this.clientApi.getCollectionChildren(collectionId).subscribe((res) => {
          this.items = res.filter(item => this.collection.items.includes(item['pid']))
          //this.items = this.items.filter(item = > fosterChildren.)

          this.items.sort((a, b) => {
            const indexA = fosterChildren.indexOf(a['pid']);
            const indexB = fosterChildren.indexOf(b['pid']);
            return indexA - indexB;
          });

          //this.view = 'detail';
          this.view = this.local.getStringProperty('collection.view');
          this.state = 'success';
          this.selection.clear();
  
          // deti 
          this.auth.getPidsAuthorizedActions(this.items.map(c=> c['pid']), null).subscribe((d:any) => {
            Object.keys(d).forEach((k)=> {
              let actions = d[k].map((v)=> v.code);
              this.collectionActions.set(k, actions);
            });
          });
        })
  
  
      });


    }, (error) => {
      console.log(error);
      this.ui.showErrorSnackBar("snackbar.error.theCollectionCouldNotBeLoaded");
    });
    this.collectionsService.getCollectionsContainingItem(collectionId).subscribe((data: [collections: Collection[], size: number]) => {
      //console.log(data)
      this.superCollections = data[0];

      this.auth.getPidsAuthorizedActions(this.superCollections.map(c=> c['id']),null).subscribe((d:any) => {
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
    this.router.navigate(['/collections/' + view + '/', this.collectionId]);
  }

  /** Vraci true, pokud je vse vybrano */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.items.length;
    return numSelected === numRows;
  }
  
  /** Vybere nebo odvybere vsechny polozky */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.items.forEach(itm => {
            this.selection.select(itm);
        });
  }

  /** udalost pro update dat; relaod from server  */  
  onUpdated() {
    this.loadData(this.collection.id);
  }

  /** udalost pro mazani cele sbirky */
  onDelete() {
    if (!this.collection) {
      return;
    }
   const dialogRef = this.dialog.open(DeleteCollectionDialogComponent, {
      width: '600px',
      panelClass: 'app-delete-collection-dialog'
    });
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

  selectAllCollections() {
    this.selectedAllCollections =! this.selectedAllCollections;
  }

  deleteSelectedCollections() {

  }

  // delete one item
  deleteSelectedItemsFromCollection() {
 
    let toDelete:string[] = [];
    this.items.forEach(itm => {
      if (this.selection.isSelected(itm)) {
        toDelete.push(itm.pid);
      }
    });


    const dialogRef2 = this.dialog.open(DeleteSelectedItemsFromCollectionComponent, {
      data: {
        "pid":this.collection.id,
        "todelete":toDelete
      },
      width: '600px',
      panelClass: 'app-add-items-to-collection'
    });
    dialogRef2.afterClosed().subscribe(result => {
      if (result === 'deleted') {
        this.selection.clear();        
        this.items = this.items.filter(item =>  {
          let pid = item['pid'];
          return !toDelete.includes(pid)
        });
      }
    });



  }


  changeOrderings(ordereditems:any[]): void{
    this.orderings = ordereditems;
  }
  

  saveReorderingOfItems() {
    this.adminApi.changeOrdering(this.collection.id, this.orderings).subscribe(() => {
      this.ui.showInfoSnackBar(`snackbar.success.changeItemsOrderSaved`);
      this.orderings = [];
    },(error) => {
      console.log(error.status);
      this.ui.showInfoSnackBar(`snackbar.error.anErrorOccurredWhileSaving`);
      this.orderings = [];
    });
  }


  onRemoveItemsFromCollection(collectionPid: string, collectionName: string, itemPids: string[], itemName) {
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

        const observables = [];

        itemPids.forEach(ipid=> {
          observables.push(this.collectionsService.removeItemFromCollection(collectionPid, ipid));
        });

        forkJoin(observables).subscribe(
          () => {
            this.ui.showInfoSnackBar(`snackbar.success.removeFromThisCollection`);
          },
          error => {
            console.log(error);
          }
        );
      }
    });
  }

  setLang(lang) {
    this.langSelected = lang;
  }

}