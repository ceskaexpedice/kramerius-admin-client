import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Collection } from 'src/app/models/collection.model';
import { CollectionsService } from 'src/app/services/collections.service';


@Component({
  selector: 'app-add-cutting-dialog',
  templateUrl: './add-cutting-dialog.component.html',
  styleUrls: ['./add-cutting-dialog.component.scss']
})
export class AddCuttingDialogComponent implements OnInit {

  collection:Collection;
  name='';
  description='';
  url='';


  urlFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern('^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$')
  ]);

  disableAddButton() {
    if (this.url) {

      const urls: string[] = this.collection.clipitems.map(obj => {
        return obj.url;
      });
      const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
      let validUrl =this.url.match(regex);
      let exists = urls.indexOf(this.url) > -1;
      if (validUrl && !exists) {
        return false; // enable button
      } else {
        return true; //disable button
      }
      
     } else return true;
  }

  constructor(
    public dialogRef: MatDialogRef<AddCuttingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data, 
    protected api:CollectionsService
    ) {

      if (data && data.collection) {
        this.collection = data.collection;
      }

   }

  ngOnInit(): void {
  }
  
  onSave() {
    if (!this.name || !this.url) {
      return;
    }
    this.api.addCuttingtoColllection(this.collection.id, {
      name: this.name,
      description: this.description,
      url: this.url
    }).subscribe(result=> {
      this.dialogRef.close('added');
    },
      (error) => {
        this.dialogRef.close('error');
      });    
  }



  //addCuttingtoColllection

}
