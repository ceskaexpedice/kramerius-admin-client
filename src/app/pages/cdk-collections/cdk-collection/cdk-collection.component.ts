import { Component, OnInit, Output,EventEmitter } from '@angular/core';
import { Collection } from 'src/app/models/collection.model';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
import { IsoConvertService } from 'src/app/services/isoconvert.service';
import { AddCuttingDialogComponent } from 'src/app/dialogs/add-cutting-dialog/add-cutting-dialog.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from 'ngx-flexible-layout';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { CollectionDetailComponent } from "../../collections/collection-detail/collection-detail.component";
import { CollectionEditComponent } from "../../collections/collection-edit/collection-edit.component";
import { CollectionContentComponent } from "../../collections/collection-content/collection-content.component";
import { CollectionContextComponent } from "../../collections/collection-context/collection-context.component";

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FlexLayoutModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatRadioModule, MatCheckboxModule,
    MatTooltipModule, MatFormFieldModule, MatInputModule, MatTabsModule, MatMenuModule, CollectionDetailComponent, CollectionEditComponent, CollectionContentComponent, CollectionContextComponent],
  selector: 'app-cdk-collection',
  templateUrl: './cdk-collection.component.html',
  styleUrls: ['./cdk-collection.component.scss']
})
export class CdkCollectionComponent implements OnInit {

  /** Collection object  */
  collection: Collection;
  state = 'none';
  availableCollections: any[];
  /** tab name */ 
  view: string;
  // contains object or cuttings
  contentView: string = 'object';

  /** all items in this collection  */
  items: any[] = []; 
  /** all cuttings in the collection */
  cuttings:any[] = [];

  /** orderings  */
  orderings: any[] = [];

  superCollections: Collection[] = []; //sbirky obsahujici tuto sbirku
  // rights 
  collectionActions:Map<string,string[]> = new Map();
  /** collection id  */
  collectionId: string;

  selectedAllCollections: boolean = false;

  public isItemChildDraged: boolean;

  /** selection model for items - object select box  */ 
  public itemSelection = new SelectionModel<any>(true, []);
  /** selection model for cuttings - cuttins select box  */
  public cuttingsSelection = new SelectionModel<any>(true, []);

  // all configured languages
  public languages: string[];

  public lang: string = 'cs';
  // seznam vsech jazyku
  public langTranslated:string[] = ['cze', 'ces'];


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
    private isoConvert: IsoConvertService,
    public appSettings: AppSettings
    ) {
  }

  ngOnInit() {
    this.languages = this.appSettings.languages;
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
      //cuttings          
      this.cuttings = this.collection.clipitems;
      
      this.clientApi.getStructure(collectionId).subscribe((response)=> {
        let children = response['children'];

        let fosterChildren = children['foster'].map((obj: any)=> obj['pid']);
        
        this.clientApi.getCollectionChildren(collectionId).subscribe((res) => {
          // items
          this.items = res.filter(item => this.collection.items.includes(item['pid']))
          this.items.sort((a, b) => {
            const indexA = fosterChildren.indexOf(a['pid']);
            const indexB = fosterChildren.indexOf(b['pid']);
            return indexA - indexB;
          });



          //this.view = this.local.getStringProperty('collection.view');
          this.view = this.router.url.replace('/cdk-collections/', '').replace('/' + this.collectionId, '');
          this.state = 'success';

          this.itemSelection.clear();
          this.cuttingsSelection.clear();

          // deti 
          this.auth.getPidsAuthorizedActions(this.items.map(c=> c['pid']), null).subscribe((d:any) => {
            Object.keys(d).forEach((k)=> {
              let actions = d[k].map((v: any)=> v.code);
              this.collectionActions.set(k, actions);
            });
          });
        })
  
  
      });


    }, (error) => {
      console.log(error);
      this.ui.showErrorSnackBar("snackbar.error.theCollectionCouldNotBeLoaded");
    });
    this.collectionsService.getCollectionsContainingItem(this.langTranslated[0], collectionId).subscribe((data: [collections: Collection[], size: number]) => {
      //console.log(data)
      this.superCollections = data[0];

      this.auth.getPidsAuthorizedActions(this.superCollections.map(c=> c['id']),null).subscribe((d:any) => {
        Object.keys(d).forEach((k)=> {
          let actions = d[k].map((v: any)=> v.code);
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
    this.local.setStringProperty('cdk-collection.view', view);
    this.router.navigate(['/cdk-collections/' + view + '/', this.collectionId]);
  }

  /** Returns true if all items are selected */
  isAllItemsSelected() {
    const numSelected = this.itemSelection.selected.length;
    const numRows = this.items.length;
    return numSelected === numRows;
  }
  
  /** Returns true if all cuttings are selected */
  isAllCuttingsSelected() {
    const numSelected = this.cuttingsSelection.selected.length;
    const numRows = this.cuttings.length;
    return numSelected === numRows;

  }
  
  /** Select or deselect all items */
  masterToggle() {
    this.isAllItemsSelected() ?
        this.itemSelection.clear() :
        this.items.forEach(itm => {
            this.itemSelection.select(itm);
        });
  }

  /** Select or deselect all cuttings */
  masterCuttingToggle() {
    this.isAllCuttingsSelected() ? this.cuttingsSelection.clear() : this.cuttings.forEach(itm=> {
      this.cuttingsSelection.select(itm);
    });
  }

  /** Update event - data referesh  */  
  onUpdated() {
    this.loadData(this.collection.id);
  }

  /** Delete event -  Delete whole collection */
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
          this.router.navigate(['/cdk-collections']);
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
        language: this.langTranslated[0],
        pid: this.collection.id,
        title: this.collection.getName(this.langTranslated[0]),
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

  deleteSelectedCuttingsFromCollection() {
    let toDelete:string[] = [];
    this.cuttings.forEach(itm => {
      if (this.cuttingsSelection.isSelected(itm)) {
        toDelete.push(itm);
      }
    });

    const data: SimpleDialogData = {
      title: this.ui.getTranslation('modal.removeCuttersFromCollection.title'),
      message: this.ui.getTranslation('modal.removeCuttersFromCollection.message'),
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
        this.collectionsService.removeBatchCuttingsFromCollection(this.collection.id, toDelete).subscribe(() => {
        //this.ui.showInfoSnackBar(`snackbar.success.removeFromThisCollection`); 
        this.ui.showInfoSnackBar(`snackbar.success.deletingItem`);
        this.loadData(this.collection.id);
      });
      }

    });

    // this.collectionsService.removeBatchItemsFromCollection(colid, todelete).subscribe( () => {
    //   this.dialogRef.close('deleted');
    // });


    // const dialogRef2 = this.dialog.open(DeleteSelectedItemsFromCollectionComponent, {
    //   data: {
    //     "pid":this.collection.id,
    //     "todelete":toDelete
    //   },
    //   width: '600px',
    //   panelClass: 'app-add-items-to-collection'
    // });
    // dialogRef2.afterClosed().subscribe(result => {
    //   if (result === 'deleted') {
    //     this.itemSelection.clear();        
    //     this.items = this.items.filter(item =>  {
    //       let pid = item['pid'];
    //       return !toDelete.includes(pid)
    //     });
    //   }
    // });

  }

  deleteSelectedItemsFromCollection() {
    let toDelete:string[] = [];
    this.items.forEach(itm => {
      if (this.itemSelection.isSelected(itm)) {
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
        this.itemSelection.clear();        
        this.items = this.items.filter(item =>  {
          let pid = item['pid'];
          return !toDelete.includes(pid)
        });
      }
    });
  }

  getBreadcrumb() {
    let langs = this.isoConvert.isTranslatable(this.lang) ? this.isoConvert.convert(this.lang) : [this.lang];
    return this.collection.names[langs[0]] || '-undefined-'
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


  onRemoveItemsFromCollection(collectionPid: string, collectionName: string, itemPids: string[], itemName: string) {
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

        const observables: any[] = [];

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

  setLang(lang: string) {
    this.lang = lang;

//    this.langTranslated = this.isoConvert.isTranslatable(this.langSelected) ? this.isoConvert.convert(this.langSelected) : [this.langSelected];
//    this.changeLang.emit(this.langTranslated);
  }

  openAddCuttingDialog() {
    const dialogRef = this.dialog.open(AddCuttingDialogComponent, {
      data:{
        collection: this.collection
      },
      width: '600px',
      panelClass: 'app-add-cutting-dialog'
    });
    

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'added') {
        this.ui.showInfoSnackBar(`snackbar.success.addingAnItem`);
        this.loadData(this.collection.id)
      } else if (result === 'error') {
        this.ui.showErrorSnackBar("snackbar.error.addingAnItem");
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      }
    });
  }


  getAllItemsSizeTitle() {
    if (this.items || this.cuttings) {
      if (this.items.length && this.cuttings.length) {
        return this.items.length +"/"+this.cuttings.length;
      } else if (this.cuttings.length) {
        return "0/"+this.cuttings.length;
      } else if (this.items.length) {
        return this.items.length;
      }
    } 
    return "0";
  }
}
