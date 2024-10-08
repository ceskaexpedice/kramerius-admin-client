import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ClientApiService } from 'src/app/services/client-api.service';
import { IsoConvertService } from 'src/app/services/isoconvert.service';

@Component({
  selector: 'app-cdk-collection-detail',
  templateUrl: './cdk-collection-detail.component.html',
  styleUrls: ['./cdk-collection-detail.component.scss']
})
export class CdkCollectionDetailComponent implements OnInit {

  @Input() collection;
  @Input() state;
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
    this.langs.forEach(l => {
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
    if (changes.lang) {
      const newLang = changes.lang.currentValue;
      this.initLangs();
    }
  }

  getKeywords() {
    let retvals = [];
    if (this.collection) {
      let langs = this.isoConvert.isTranslatable(this.lang) ? this.isoConvert.convert(this.lang) : [this.lang];
      langs.forEach(l=> {
        if (this.collection.keywords[l]) {

          this.collection.keywords[l].forEach(k=>{
            retvals.push(k);
          });
          //this.collection.keywords[l].forEach(k=>{retvals.push(k);});
        }
      });
    }
    return retvals;
  }

  getThumb(col) {
    if (col) {
        return this.clientService.getThumb(col.id);
    }     
    else return 'assets/img/no-image.png';
  }
}
