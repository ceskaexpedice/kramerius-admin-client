import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from 'ngx-flexible-layout';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { Collection } from 'src/app/models/collection.model';
import { ClientApiService } from 'src/app/services/client-api.service';
import { CollectionsService } from 'src/app/services/collections.service';
import { IsoConvertService } from 'src/app/services/isoconvert.service';
import { UIService } from 'src/app/services/ui.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FlexLayoutModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, 
    MatTooltipModule, MatProgressBarModule
  ],
  selector: 'app-collection-context',
  templateUrl: './collection-context.component.html',
  styleUrls: ['./collection-context.component.scss']
})
export class CollectionContextComponent implements OnInit {

  @Input() collection: Collection;
  @Input() state: string;
  @Input() superCollections: Collection[];
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

  allowEdit(pid: string) {
    if (this.collectionActions.has(pid)) {
      if (this.collectionActions.get(pid).includes('a_collections_edit')) {
        return true;
      }
    }
    return false;
  }

  getName(item: any): string {
    let langs = this.isoConvert.isTranslatable(this.lang) ? this.isoConvert.convert(this.lang) : [this.lang];
    return item.names[langs[0]];
  }


  getDescription(item: any):string {
    let langs = this.isoConvert.isTranslatable(this.lang) ? this.isoConvert.convert(this.lang) : [this.lang];
    return item.descriptions[langs[0]];

  }

  
  getThumb(uuid: string): string {
    return this.clientApi.getThumb(uuid);
  }

  onRemoveItemFromCollection(collectionPid: string, collectionName: string, itemPid: string, itemName: string) {
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

  removeItemFromAnotherCollection(superCollection: any, collection: any, event: Event) {
    this.onRemoveItemFromCollection(superCollection.id, superCollection.getName(), collection['id'], collection.getName());
    event.preventDefault(); 
    event.stopPropagation();
  }
}
