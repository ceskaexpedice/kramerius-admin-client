import { HtmlAstPath } from '@angular/compiler';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { Collection } from 'src/app/models/collection.model';
import { ClientApiService } from 'src/app/services/client-api.service';
import { CollectionsService } from 'src/app/services/collections.service';
import { UIService } from 'src/app/services/ui.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { SelectionModel } from '@angular/cdk/collections';
import { forkJoin } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';

import { AdminApiService } from 'src/app/services/admin-api.service';
import { DeleteSelectedItemsFromCollectionComponent } from 'src/app/dialogs/delete-selected-items-from-collection/delete-selected-items-from-collection.component';

@Component({
  selector: 'app-collection-content',
  templateUrl: './collection-content.component.html',
  styleUrls: ['./collection-content.component.scss']
})
export class CollectionContentComponent implements OnInit {

  @Input() collection;
  @Input() state;
  @Input() items;

  @Input() collectionActions:Map<string,string[]>;
  @Input() selection:SelectionModel<any>;

  isThumb: boolean;
  
  public orderingChanged: boolean = false;

  // update event
  @Output() updated = new EventEmitter<any>();
  @Output() dragEvent = new EventEmitter<any>();

  @Output() deleteitems = new EventEmitter<any>();

  collectionItems;
  noncollectionItems;

  constructor(
    private collectionsService: CollectionsService,
    private ui: UIService,
    private dialog: MatDialog,
    private clientApi: ClientApiService,
    private adminApi: AdminApiService
  ) { 


  }

  ngOnInit(): void {
    
    //this.collectionItems = this.items.filter(item => item['model'] == 'collection');
    this.collectionItems = [];
    this.noncollectionItems =  this.items;
  }

  getName(item): string {
    let name = item['title.search'];
    if (item['date.str'] && ['page', 'periodicalitem', 'periodicalvolume'].indexOf(item['model']) >= 0) {
      name += ' / ' + item['date.str'];
    }
    return name;
  }


  public handleMissingImage(event: Event) {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  getThumb(uuid: string): string {
    return this.clientApi.getThumb(uuid);
  }

  // Whether the number of selected elements matches the total number of rows
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.items.length;
    return numSelected === numRows;
  }
  
    // Selects all rows if they are not all selected; otherwise clear selection.
    masterToggle() {
      this.isAllSelected() ?
          this.selection.clear() :
          this.items.forEach(itm => {
              this.selection.select(itm);
          });
    }
  

  // TODO: move to utils ts
  allowEdit(pid) {
    if (this.collectionActions.has(pid)) {
      if (this.collectionActions.get(pid).includes('a_collections_edit')) {
        return true;
      }
    }
    return false;
  }


  // TODO: Move to utils ts
  allowEditRemove(pid) {
    if (this.collectionActions.has(pid)) {
      if (this.collectionActions.get(pid).includes('a_able_tobe_part_of_collections')) {
        return true;
      }
    }
    return false;
  }



  onRemoveItemFromCollection(collectionPid: string, collectionName: string, itemPids: string[], itemName) {
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
            
            delay(300),
            this.ui.showInfoSnackBar(`snackbar.success.removeFromThisCollection`);
            this.updated.emit();
          },
          error => {
            console.log(error);
          }
        );
      }
    });
  }

  removeItemFromCollection(item, collection, event) {
    let itempids:string[] = [item['pid']];
    this.onRemoveItemFromCollection(collection.id, collection.getName(), itempids, this.getName(item)); 
    event.preventDefault(); 
    event.stopPropagation();
  }

  
  // drag and drop sorting
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.noncollectionItems, event.previousIndex, event.currentIndex);
    if (event.previousIndex !== event.currentIndex) {
      this.ui.showInfoSnackBar(`snackbar.success.changeItemsOrder`);

      this.orderingChanged = true;
      let arr = this.noncollectionItems.map(obj=> obj['pid']);
      this.dragEvent.emit(arr);
    }
  }

}
