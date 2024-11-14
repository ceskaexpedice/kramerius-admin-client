import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { Collection } from 'src/app/models/collection.model';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic/';
import '@ckeditor/ckeditor5-build-classic/build/translations/cs';
import { ActivatedRoute, Router } from '@angular/router';
import { UIService } from 'src/app/services/ui.service';
import { CollectionsService } from 'src/app/services/collections.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateNewCollectionDialogComponent } from 'src/app/dialogs/create-new-collection-dialog/create-new-collection-dialog.component';
import { IsoConvertService } from 'src/app/services/isoconvert.service';
import { ClientApiService } from 'src/app/services/client-api.service';

@Component({
  selector: 'app-cdk-collection-edit',
  templateUrl: './cdk-collection-edit.component.html',
  styleUrls: ['./cdk-collection-edit.component.scss']
})
export class CdkCollectionEditComponent implements OnInit {

  editorCze = ClassicEditor; //BalloonEditor;
  editorEng = ClassicEditor; //BalloonEditor;

  editorConfig = {
    // placeholder: 'Popis sbírky',
    language: 'cs',
    toolbar: ['heading', '|', 'bold', 'italic', '|', 'link', '|', 'bulletedList', 'numberedList', '|', 'blockQuote'],
  };

  keywordToDelete: string = '';

  collection: Collection;
  collectionName: string;
  mode = 'none';
  state = 'none';
  author='';

  //test ='testovacimodel'

  keyword:string;

  name:string;
  description:string;
  content: string;
  standalone:boolean = false;
  langs:string[];

  @Input() colId;
  @Input() lang:any;

  @Output() updated = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();


  constructor(
    private route: ActivatedRoute,
    private ui: UIService,
    private router: Router,
    private collectionsService: CollectionsService,
    private clientService: ClientApiService,
    private isoConvert: IsoConvertService,
    private dialog: MatDialog) {
  }

  ngOnInit() {
    //this.initLangs();

    this.state = 'loading';
    if (this.colId) {
      this.collectionsService.getCollection(this.colId).subscribe((collection: Collection) => {

        this.collection = collection;
        this.collectionName = collection.names[this.langs[0]];
        this.init('edit');
      });
    } else {
      this.route.params.subscribe(params => {
        if (params['id']) {
          this.collectionsService.getCollection(params['id']).subscribe((collection: Collection) => {
            this.collection = collection;
            this.collectionName = collection.names[this.langs[0]];
            this.init('edit');
          });
        } else {
          this.collection = new Collection();
          this.init('new');
        }
      });
    }
  }

  private initCollectionLangValues() {
    this.langs = this.isoConvert.isTranslatable(this.lang) ? this.isoConvert.convert(this.lang) : [this.lang];
    
    this.name = '';// + this.langs;
    this.description = '';
    this.content = '';
    this.standalone = false;
    this.author = '';

    if (this.collection) {
      this.langs.forEach(l => {
        if (this.collection.names[l]) {
          this.name = this.collection.names[l];
        }      
        if (this.collection.descriptions[l]) {
          this.description = this.collection.descriptions[l];
        }      
        if (this.collection.contents[l]) {
          this.content = this.collection.contents[l];
        }
      });
      
      this.author = this.collection.author;

      this.standalone = this.collection.standalone;
    }
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes.lang) {
      const newLang = changes.lang.currentValue;
      this.initCollectionLangValues();
    }
  }

  private init(mode: string) {
    this.mode = mode;
    this.state = 'success';
    this.initCollectionLangValues();
  }

  onModelLangChange(key:string, newValue: string) {
    this.langs.forEach(l => {
      this.collection[key][l] = newValue;
    });
  }

  onStandaloChange(std:boolean) {
    this.collection.standalone = std;
  }

  onAuthorChange(auth:string) {
    this.collection.author = auth;
  }

  reloadtimestamp:number;

  getThumb(col) {
    if (col) {
      if (this.reloadtimestamp) {
        return this.clientService.getThumb(col.id)+"?reloadtimestap="+this.reloadtimestamp;

      } else {
        return this.clientService.getThumb(col.id);
      }
    }     
    else return 'assets/img/no-image.png';
  }

  onFileSelected(event: any) {

    const file: File = event.target.files[0];
    if (file) {
      this.collectionsService.uploadCollectionThumbnail(this.colId, file).subscribe(s=> {
        this.reloadtimestamp = (new Date()).getTime();
        console.log(s);
      }, error => {
        console.log(error);
    }); 
  }
  // }).subscribe(response => {
  //   this.dialogRef.close("scheduled");
  //   this.ui.showInfoSnackBar('snackbar.success.changeFlagOnLicense');
  // }, error => {
  //   console.log(error);
  //   this.dialogRef.close('error');
  // });

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
        }
      });
    }
    return retvals;
  }


  newKeyword() {

    let langs = this.isoConvert.isTranslatable(this.lang) ? this.isoConvert.convert(this.lang) : [this.lang];
    langs.forEach(l=> {

      if (!this.collection.keywords[l]) {
        this.collection.keywords[l] = [];
      }
  
      if (this.keyword) {
        this.collection.keywords[l].push(this.keyword);
        this.keyword = '';
      }
    });

  }

  


  onSave() {

    this.collectionsService.createCollection(this.collection).subscribe(response => {
      const dialogRef = this.dialog.open(CreateNewCollectionDialogComponent, {
        data: response,
        width: '600px',
        panelClass: 'app-create-new-collection-dialog'
      });
    },
      (error) => {
        console.log(error);
        this.ui.showErrorSnackBar("snackbar.error.collectionHasBeenCreated");
      });
  }


  onUpdate() {
    this.state = 'loading';
    this.collectionsService.updateCollection(this.collection).subscribe(() => {
        this.ui.showInfoSnackBar("snackbar.success.theCollectionHasBeenModified");
        if (this.colId) {
          this.updated.emit();
          this.state = 'success';
        } else {
          this.router.navigate(['/collections', this.collection.id]);
        }
      },
      (error) => {
        this.state = 'error';
        console.log(error);
        this.ui.showErrorSnackBar("snackbar.error.theCollectionHasBeenModified");
      });
  }

  onDelete() {
    this.delete.emit();
  }

  deleteKeyword(keyword: string) {
    let langs = this.isoConvert.isTranslatable(this.lang) ? this.isoConvert.convert(this.lang) : [this.lang];
    langs.forEach(l=> {
      this.collection.keywords[l] = this.collection.keywords[l].filter(item => item !== keyword);
    });
  }

}
