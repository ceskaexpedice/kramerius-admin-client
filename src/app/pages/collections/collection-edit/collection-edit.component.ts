import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Collection } from 'src/app/models/collection.model';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic/';
import '@ckeditor/ckeditor5-build-classic/build/translations/cs';
import { ActivatedRoute, Router } from '@angular/router';
import { UIService } from 'src/app/services/ui.service';
import { CollectionsService } from 'src/app/services/collections.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateNewCollectionDialogComponent } from 'src/app/dialogs/create-new-collection-dialog/create-new-collection-dialog.component';

@Component({
  selector: 'app-collection-edit',
  templateUrl: './collection-edit.component.html',
  styleUrls: ['./collection-edit.component.scss']
})
export class CollectionEditComponent implements OnInit {

  editorCze = ClassicEditor; //BalloonEditor;
  editorEng = ClassicEditor; //BalloonEditor;

  editorConfig = {
    // placeholder: 'Popis sbírky',
    language: 'cs',
    toolbar: ['heading', '|', 'bold', 'italic', '|', 'link', '|', 'bulletedList', 'numberedList', '|', 'blockQuote'],
  };

  collection: Collection;
  collectionName: string;
  mode = 'none';
  state = 'none';

  @Input() colId;
  @Input() lang;

  @Output() updated = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();


  constructor(
    private route: ActivatedRoute,
    private ui: UIService,
    private router: Router,
    private collectionsService: CollectionsService,
    private dialog: MatDialog) {
  }

  ngOnInit() {
    this.state = 'loading';
    if (this.colId) {
      this.collectionsService.getCollection(this.colId).subscribe((collection: Collection) => {
        this.collection = collection;
        this.collectionName = collection.name_cze ? collection.name_cze : collection.name_eng;
        this.init('edit');
      });
    } else {
      this.route.params.subscribe(params => {
        if (params['id']) {
          this.collectionsService.getCollection(params['id']).subscribe((collection: Collection) => {
            this.collection = collection;
            this.collectionName = collection.name_cze ? collection.name_cze : collection.name_eng;
            this.init('edit');
          });
        } else {
          this.collection = new Collection();
          this.init('new');
        }
      });
    }
  }

  private init(mode: string) {
    this.mode = mode;
    this.state = 'success';
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
}