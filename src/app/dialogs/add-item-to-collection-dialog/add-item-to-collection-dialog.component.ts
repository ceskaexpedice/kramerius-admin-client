import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Collection } from 'src/app/models/collection.model';
import { CollectionsService } from 'src/app/services/collections.service';


@Component({
  selector: 'app-add-item-to-collection-dialog',
  templateUrl: './add-item-to-collection-dialog.component.html',
  styleUrls: ['./add-item-to-collection-dialog.component.scss']
})
export class AddItemToCollectionDialogComponent implements OnInit {


  pid;
  title;
  isCollection = false;

  potentialSuperCollections = [];
  selectedSuperCollection;

  inProgress = false;

  constructor(public dialogRef: MatDialogRef<AddItemToCollectionDialogComponent>, @Inject(MAT_DIALOG_DATA) public data, private collectionApi: CollectionsService) {
    if (data) {
      this.pid = data.pid;
      this.title = data.title;
      this.isCollection = data.isCollection;

      this.collectionApi.getCollectionsContainingItem(this.pid).subscribe((data: [collections: Collection[], size: number]) => {
        let pidsOfCurrentSuperCollections = data[0].map(collection => collection.id);
        //TODO: handle offset, limit
        this.collectionApi.getCollections(0, 999).subscribe((data: [collections: Collection[], size: number]) => {
          this.potentialSuperCollections = data[0].filter(collection => collection.id != this.pid && !pidsOfCurrentSuperCollections.includes(collection.id))
        }, (error) => {
          console.log(error);
          //TODO: handle error
          //this.ui.showErrorSnackBar("Nepodařil načíst seznam všech sbírek")
        });
      }, (error) => {
        console.log(error);
        //TODO: handle error
        //this.ui.showErrorSnackBar("Nepodařil načíst seznam sbírek obsahujích tuto sbírku")
      });
    }
  }

  ngOnInit() {
  }

  onAdd(formData) {
    this.inProgress = true;
    this.collectionApi.addItemToCollection(this.selectedSuperCollection.id, this.pid)
      .subscribe(() => {
        this.dialogRef.close('added');
      }, error => {
        console.log(error);
        this.dialogRef.close('error');
      });
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

  selectSuperCollection(collection: Collection) {
    this.selectedSuperCollection = collection;
  }

}
