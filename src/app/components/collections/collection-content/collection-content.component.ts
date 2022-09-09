import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { Collection } from 'src/app/models/collection.model';
import { ClientApiService } from 'src/app/services/client-api.service';
import { CollectionsService } from 'src/app/services/collections.service';
import { UIService } from 'src/app/services/ui.service';

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


  //linkEnabled = false;

  @Output() updated = new EventEmitter<any>();

  constructor(
    private collectionsService: CollectionsService,
    private ui: UIService,
    private dialog: MatDialog,
    private clientApi: ClientApiService
  ) { }

  ngOnInit(): void {
  }

  getName(item): string {
    let name = item['title.search'];
    if (item['date.str'] && ['page', 'periodicalitem', 'periodicalvolume'].indexOf(item['model']) >= 0) {
      name += ' / ' + item['date.str'];
    }
    return name;
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

  getThumb(uuid: string): string {
    return this.clientApi.getThumb(uuid);
  }

  filterCollections(items) {
    return items.filter(item => item['model'] == 'collection');
  }

  filterNonCollections(items) {
    return items.filter(item => item['model'] != 'collection');
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
          this.updated.emit();
        }, (error) => {
          console.log(error);
          this.ui.showErrorSnackBar("snackbar.error.removeFromThisCollection");
        });
      }
    });
  }

  removeItemFromCollection(item, collection, event) {
    this.onRemoveItemFromCollection(collection.id, collection.getName(), item['pid'], this.getName(item)); 
    event.preventDefault(); 
    event.stopPropagation();
  }
}
