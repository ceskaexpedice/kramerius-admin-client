import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';

import { Collection } from 'src/app/models/collection.model';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { CollectionsService } from 'src/app/services/collections.service';


@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, MatDialogModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatTooltipModule, MatFormFieldModule, MatInputModule],
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
    @Inject(MAT_DIALOG_DATA) public data: any, 
    protected api:CollectionsService,
    protected adminApi:AdminApiService,
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



  isClipUrl(): boolean {
    const retflag = this.adminApi.isClipUrl(this.url);
    console.log("Const retflag "+retflag);
    return retflag;
  }


}
