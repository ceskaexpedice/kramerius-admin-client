import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Collection } from 'src/app/models/collection.model';
import { ClientApiService } from 'src/app/services/client-api.service';
import { IsoConvertService } from 'src/app/services/isoconvert.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, 
    MatTooltipModule, MatProgressBarModule, MatCheckboxModule
  ],
  selector: 'app-collection-detail',
  templateUrl: './collection-detail.component.html',
  styleUrls: ['./collection-detail.component.scss']
})
export class CollectionDetailComponent implements OnInit {

  
  @Input() collection: Collection;
  @Input() state: string;
  @Input() lang:any;

  name:string;
  description:string;
  content: string;
  langs:any;

  constructor(    
    private isoConvert: IsoConvertService,
    private clientService: ClientApiService
    ) { }

  ngOnInit() {
    this.initLangs();
  }

  initLangs() {
    this.name = '' ;
    this.description = '';
    this.content = '';

    this.langs = this.isoConvert.isTranslatable(this.lang) ? this.isoConvert.convert(this.lang) : [this.lang];
    this.langs.forEach((l: string) => {
      if (this.collection.names && this.collection.names[l]) {
        this.name = this.collection.names[l];
      }      
      if (this.collection.descriptions && this.collection.descriptions[l]) {
        this.description = this.collection.descriptions[l];
      }      
      if (this.collection.contents && this.collection.contents[l]) {
        this.content = this.collection.contents[l];
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['lang']) {
      const newLang = changes['lang'].currentValue;
      this.initLangs();
    }
  }

  getKeywords() {
    let retvals: string[] = [];
    if (this.collection) {
      let langs = this.isoConvert.isTranslatable(this.lang) ? this.isoConvert.convert(this.lang) : [this.lang];
      langs.forEach(l=> {
        if (this.collection.keywords[l]) {

          this.collection.keywords[l].forEach((k: string)=>{
            retvals.push(k);
          });
          //this.collection.keywords[l].forEach(k=>{retvals.push(k);});
        }
      });
    }
    return retvals;
  }

  getThumb(col: Collection) {
    if (col) {
        return this.clientService.getThumb(col.id);
    }     
    else return 'assets/img/no-image.png';
  }


}
