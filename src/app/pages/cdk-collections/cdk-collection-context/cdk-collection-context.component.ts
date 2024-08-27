import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { ClientApiService } from 'src/app/services/client-api.service';
import { CollectionsService } from 'src/app/services/collections.service';
import { IsoConvertService } from 'src/app/services/isoconvert.service';
import { UIService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-cdk-collection-context',
  templateUrl: './cdk-collection-context.component.html',
  styleUrls: ['./cdk-collection-context.component.scss']
})
export class CdkCollectionContextComponent implements OnInit {

  @Input() collection;
  @Input() state;
  @Input() superCollections;
  @Input() collectionActions:Map<string,string[]>;

  @Input() lang:string;

  @Output() updated = new EventEmitter<any>();


  constructor(
    private collectionsService: CollectionsService,
    private ui: UIService,
    private dialog: MatDialog,
    private clientApi: ClientApiService,
    private isoConvert: IsoConvertService
  ) { }

  ngOnInit(): void {

  }

  allowEdit(pid) {
    if (this.collectionActions.has(pid)) {
      if (this.collectionActions.get(pid).includes('a_collections_edit')) {
        return true;
      }
    }
    return false;
  }

  getName(item): string {
    let langs = this.isoConvert.isTranslatable(this.lang) ? this.isoConvert.convert(this.lang) : [this.lang];
    return item.names[langs[0]];
  }


  getDescription(item):string {
    let langs = this.isoConvert.isTranslatable(this.lang) ? this.isoConvert.convert(this.lang) : [this.lang];
    return item.descriptions[langs[0]];

  }

  
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
          this.updated.emit();
        }, (error) => {
          console.log(error);
          this.ui.showErrorSnackBar("snackbar.error.removeFromThisCollection");
        });
      }
    });
  }

  removeItemFromAnotherCollection(superCollection, collection, event) {
    this.onRemoveItemFromCollection(superCollection.id, superCollection.getName(), collection['id'], collection.getName());
    event.preventDefault(); 
    event.stopPropagation();
  }

}
