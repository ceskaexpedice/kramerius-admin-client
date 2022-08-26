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
  potentialSuperCollectionsAll = [];
  selectedSuperCollection;

  inProgress = false;

  query: string;

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
          this.potentialSuperCollectionsAll = this.potentialSuperCollections;
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
    this.query = "";
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

  selectSuperCollection(collection: Collection) {
    this.selectedSuperCollection = collection;
  }

  onSearch() {
    if (!!this.query) {
      this.potentialSuperCollections = this.potentialSuperCollectionsAll.filter(collection => {
        return collection.name_cze.toLocaleLowerCase().indexOf(this.query.toLocaleLowerCase()) > -1
      });
    } else {
      this.potentialSuperCollections = this.potentialSuperCollectionsAll;
    }
  }
  
}
