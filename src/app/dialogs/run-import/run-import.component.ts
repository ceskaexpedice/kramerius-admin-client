import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Collection } from 'src/app/models/collection.model';
import { License } from 'src/app/models/license.model';
import { AppSettings } from 'src/app/services/app-settings';
import { ClientApiService } from 'src/app/services/client-api.service';
import { IsoConvertService } from 'src/app/services/isoconvert.service';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';

import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from 'ngx-flexible-layout';
import { MatSelectModule } from '@angular/material/select';
import { MatRippleModule } from '@angular/material/core';
import {MatCheckboxModule} from '@angular/material/checkbox';


@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FlexLayoutModule, 
    FormsModule,  MatFormFieldModule, MatInputModule, 
    MatDialogModule, MatSelectModule, MatCheckboxModule, MatRippleModule,
    MatIconModule, MatCardModule, MatTooltipModule
     ],
  selector: 'app-run-import',
  templateUrl: './run-import.component.html',
  styleUrls: ['./run-import.component.scss']
})
export class RunImportComponent implements OnInit {

  /** Collections */
  addCollection: boolean = false; // import & add collection

   languages: any[];
  // //langSelected: string = 'cs';
   langTranslated:string[] = ['cze', 'ces'];
   lang: string;

   


  selectedCollection:Collection;
  allCollections:Collection[];

  /** Selected licences */
  selectedLicense:License;
  licenses:License[];

  scheduleIndexation: boolean = true;

  ndkIIPServer:boolean = true;
  type="foxml";

  constructor(    
    public dialogRef: MatDialogRef<RunImportComponent>,
    private clientApi: ClientApiService,
    private appSettings:AppSettings,
    private isoConvert: IsoConvertService,


    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.licenses = data.licenses;
    this.type= data.type;
  }


  ngOnInit(): void {
    this.languages = this.appSettings.languages;
    this.lang = this.appSettings.defaultLang;
    this.collectionsReload();
    // this.subject.pipe(
    //   debounceTime(400)
    // ).subscribe(searchTextValue => {
    //   this.collectionsReload();
    // });
  }

  displayLanguage() {
    if (this.isoConvert.isTranslatable(this.lang)) {
      return this.isoConvert.convert(this.lang)[0];
    }
    return this.lang;
  }

  name(col:Collection) {
    const lang = this.displayLanguage();    
    if (col) {
      if (lang) {
        const retval = col.names[lang];
        //console.log("RETVAL "+retval);
        return retval.join(";");
      }else {
        const keys = Object.keys(col.names);
        const retval = col.names[keys[0]];
        return retval.join(";");
      }  
    } else return null;
  }

  allNames(col:Collection) {
    const keys = Object.keys(col.names);
    const retval = keys.map(k=> col.names[k]).join(';');
    return retval;
  }

  onScheduleIndexationChange(isChecked: boolean) {
    this.scheduleIndexation = isChecked;
    if (!isChecked) {
      this.addCollection = false;
    }
  }

  onSelectCollectionChange(isChecked: boolean) {
    this.addCollection = isChecked;
    if (!isChecked) {
      this.selectedCollection = null;
    }
  }

  collectionsReload() {
    this.clientApi.getCollections(1000, 0, false, '', 'created', 'asc').subscribe((res: any)  => {
      this.allCollections = res["docs"].map((d: any)=> {
        let col:Collection = new Collection();
        // zjistit jazyk a pokud neni, search.title, collection.desc atd..         
        col.id= d.pid;
        col.standalone = d["collection.is_standalone"];
        
        col.names = {};
        
        for (const key in d) {
          if (key.startsWith("title.search_")) {
            // Extrahujeme klíč za podtržítkem
            const newKey = key.substring("title.search_".length);
            
            // Přidáme nový klíč a hodnotu do objektu titles
            col.names[newKey] = d[key];
          }
          if (key.startsWith("collection.desc_")) {
            // Extrahujeme klíč za podtržítkem
            const newKey = key.substring("collection.desc_".length);
            
            // Přidáme nový klíč a hodnotu do objektu titles
            col.descriptions[newKey] = d[key];
          }
        }
        let languages = this.appSettings.languages;
        languages.forEach((lang: string) => {
          let converted:string[] = this.isoConvert.convert(lang);
          converted.forEach(conv => {
            if (!col.names[conv]) {
              col.names[conv] = '-undefined-' ;
            }
            if (!col.descriptions[conv] && d["collection.desc"] && d["collection.desc"][0]) {
              col.descriptions[conv] = '-undefined-';
            }
          });
        });
        col.createdAt = d["created"]
        col.modifiedAt = d["modified"]
        return col;
      });
    });
  }

  scheduleProcess() {
    const data = {
      selectedLicense:  this.selectedLicense,
      scheduleIndexation: this.scheduleIndexation,
      ndkIIPServer: this.ndkIIPServer,
      selectedCollection: this.selectedCollection?.id 
    };
    this.dialogRef.close(data);
  }

}
