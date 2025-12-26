import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { Collection } from 'src/app/models/collection.model';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic/';
import '@ckeditor/ckeditor5-build-classic/build/translations/cs';
import coreTranslations from 'ckeditor5/translations/cs.js';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UIService } from 'src/app/services/ui.service';
import { CollectionsService } from 'src/app/services/collections.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateNewCollectionDialogComponent } from 'src/app/dialogs/create-new-collection-dialog/create-new-collection-dialog.component';
import { IsoConvertService } from 'src/app/services/isoconvert.service';
import { ClientApiService } from 'src/app/services/client-api.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { List } from 'echarts';
import { catchError, map, of, switchMap, take } from 'rxjs';
import { AdminApiService } from 'src/app/services/admin-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatTooltipModule, MatProgressBarModule, MatCheckboxModule,
    CKEditorModule
  ],
  selector: 'app-collection-edit',
  templateUrl: './collection-edit.component.html',
  styleUrls: ['./collection-edit.component.scss']
})
export class CollectionEditComponent implements OnInit {

  editorCze = ClassicEditor; //BalloonEditor;
  editorEng = ClassicEditor; //BalloonEditor;

  public Editor = ClassicEditor as any;


  public editorConfig = {
    translations: [
      coreTranslations
    ],
    licenseKey: 'GPL',
    language: 'cs',
    toolbar: ['undo', 'redo', '|', 'bold', 'italic', '|', 'link', '|', 'bulletedList', 'numberedList', '|', 'blockQuote'],
    placeholder: 'Popis sbírky...'
  }

  keywordToDelete: string = '';

  collection: any;
  collectionName: string;
  mode = 'none';
  state = 'none';
  author = '';


  keyword: string;

  name: string;
  description: string;
  content: string;
  standalone: boolean = false;
  langs: string[];

  @Input() colId: string;
  @Input() lang: any;

  @Output() updated = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();


  constructor(
    private route: ActivatedRoute,
    private ui: UIService,
    private router: Router,
    private collectionsService: CollectionsService,
    private clientService: ClientApiService,
    private adminService: AdminApiService,
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
    if (changes['lang']) {
      const newLang = changes['lang'].currentValue;
      this.initCollectionLangValues();
    }
  }

  private init(mode: string) {
    this.mode = mode;
    this.state = 'success';
    this.initCollectionLangValues();
  }

  onModelLangChange(key: string, newValue: string) {
    this.langs.forEach(l => {
      this.collection[key][l] = newValue;
    });
  }

  onStandaloChange(std: boolean) {
    this.collection.standalone = std;
  }

  onAuthorChange(auth: string) {
    this.collection.author = auth;
  }

  reloadtimestamp: number;

  getThumb(col: any) {
    if (col) {
      if (this.reloadtimestamp) {
        return this.clientService.getThumb(col.id) + "?reloadtimestap=" + this.reloadtimestamp;

      } else {
        return this.clientService.getThumb(col.id);
      }
    }
    else return 'assets/img/no-image.png';
  }

  onFileSelected(event: any) {

    const file: File = event.target.files[0];
    if (file) {
      this.collectionsService.uploadCollectionThumbnail(this.colId, file).subscribe(s => {
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
    let retvals: any[] = [];
    if (this.collection) {
      let langs = this.isoConvert.isTranslatable(this.lang) ? this.isoConvert.convert(this.lang) : [this.lang];
      langs.forEach(l => {
        if (this.collection.keywords[l]) {

          this.collection.keywords[l].forEach((k: any) => {
            retvals.push(k);
          });
        }
      });
    }
    return retvals;
  }


  newKeyword() {

    let langs = this.isoConvert.isTranslatable(this.lang) ? this.isoConvert.convert(this.lang) : [this.lang];
    langs.forEach(l => {

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
  this.collectionsService.createCollection(this.collection)
    .pipe(
      take(1), 
      switchMap((response: any) => {
        if (response && response.scheduleMainProcess) {
          const scheduleData = response.scheduleMainProcess;
          return this.adminService.scheduleProcess({
            defid: scheduleData.profileId,
            params: scheduleData.payload
          }).pipe(
            map((processRes) => {
              return { 
                collection: response, 
                process: processRes 
              };
            }),
            catchError(err => {
              this.ui.showErrorSnackBar("Kolekce vytvořena, ale plánování procesu selhalo");
              return of(response); 
            })
          );
        }
       return of({ collection: response, process: null });
      })
    )
    .subscribe({
      next: (combinedData) => {
        this.dialog.open(CreateNewCollectionDialogComponent, {
          //data: combinedData.collection,
          data: combinedData,
          width: '600px',
          panelClass: 'app-create-new-collection-dialog'
        });
        
      },
      error: (error) => {
        this.ui.showErrorSnackBar("snackbar.error.collectionCreationFailed");
      }
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
    langs.forEach(l => {
      this.collection.keywords[l] = this.collection.keywords[l].filter((item: string) => item !== keyword);
    });
  }
}