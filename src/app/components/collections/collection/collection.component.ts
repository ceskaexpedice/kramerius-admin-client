import { Component, OnInit } from '@angular/core';
import { Collection } from 'src/app/models/collection.model';
import { ActivatedRoute, Router } from '@angular/router';
import { UIService } from 'src/app/services/ui.service';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { MatDialog } from '@angular/material';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { CollectionsService } from 'src/app/services/collections.service';
import { ClientApiService } from 'src/app/services/client-api.service';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss']
})
export class CollectionComponent implements OnInit {

  collection: Collection;
  state = 'none';
  availableCollections: any[];

  items: any[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ui: UIService,
    private dialog: MatDialog,
    private clientApi: ClientApiService,
    private collectionsService: CollectionsService) {
  }

  ngOnInit() {
    this.state = 'loading';
    this.route.params.subscribe(params => {
      this.loadData(params['id']);
    });
  }

  loadData(collectionId: string) {
    this.collectionsService.getCollection(collectionId).subscribe((collection: Collection) => {
      this.collection = collection;
      this.clientApi.getCollectionChildren(collectionId).subscribe((res) => {
        this.items = res;
        console.log('res', res);
        this.state = 'success';
      })
    }, (error) => {
      console.log(error);
      this.ui.showErrorSnackBar("Sbírku se nepodařilo načíst")
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
        color: 'default'
      }
    };
    const dialogRef = this.dialog.open(SimpleDialogComponent, { data: data });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.collectionsService.deleteCollection(this.collection).subscribe(result => {
          this.ui.showInfoSnackBar("Sbírka byla odstraněna")
          this.router.navigate(['/collections']);
        }, (error) => {
          console.log(error);
          this.ui.showErrorSnackBar("Sbírku se nepodařilo odstranit")
        });
      }
    });
  }

  addThisToCollection(collection_uuid: string) {
    //console.log("collection.component: adding item " + this.collection.id + " to collection " + collection_uuid)
    this.collectionsService.addItemToCollection(collection_uuid, this.collection.id).subscribe((res) => {
      console.log('ressss', res);
    });

  }

  onRemoveItemFromCollection(itemPid: string) {
    //TODO: mozna potvrzovací dialog
    this.collectionsService.removeItemFromCollection(this.collection.id, itemPid).subscribe(() => {
      (async () => {
        await this.delay(0);
        this.loadData(this.collection.id);
      })();
    }, (error) => {
      console.log(error);
      this.ui.showErrorSnackBar("Položku se nepodařilo odstranit ze sbírky")
    });
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  loadCollections() {
    this.clientApi.getAvailableCollections(this.collection.id).subscribe((collections: any[]) => {
      this.availableCollections = collections;
    });
  }
  

}