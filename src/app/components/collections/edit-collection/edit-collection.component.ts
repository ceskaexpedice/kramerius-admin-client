import { Component, OnInit } from '@angular/core';
import { Collection } from 'src/app/models/collection.model';
import { ClassicEditor } from '@ckeditor/ckeditor5-build-classic/';
import '@ckeditor/ckeditor5-build-classic/build/translations/cs';
import { ActivatedRoute, Router } from '@angular/router';
import { UIService } from 'src/app/services/ui.service';
import { CollectionsService } from 'src/app/services/collections.service';

@Component({
  selector: 'app-edit-collection',
  templateUrl: './edit-collection.component.html',
  styleUrls: ['./edit-collection.component.scss']
})
export class EditCollectionComponent implements OnInit {

  editor = ClassicEditor; //BalloonEditor;

  editorConfig = {
    // placeholder: 'Popis sbírky',
    language: 'cs',
    toolbar: ['heading', '|', 'bold', 'italic', '|', 'link', '|', 'bulletedList', 'numberedList', '|', 'blockQuote'],
  };

  collection: Collection;
  collectionName: string;
  mode = 'none';
  state = 'none';

  constructor(
    private route: ActivatedRoute,
    private ui: UIService,
    private router: Router,
    private collectionsService: CollectionsService) {
  }

  ngOnInit() {
    this.state = 'loading';
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.collectionsService.getCollection(params['id']).subscribe((collection: Collection) => {
          this.collection = collection;
          this.collectionName = collection.name;
          this.init('edit');
        });
      } else {
        this.collection = new Collection();
        this.init('new');
      }
    });
  }

  private init(mode: string) {
    this.mode = mode;
    this.state = 'success';
  }


  onSave() {
    this.collectionsService.createCollection(this.collection).subscribe(() => {
      this.ui.showInfoSnackBar("Sbírka byla vytvořena");
      this.router.navigate(['/collections', this.collection.id]);
    },
      (error) => {
        console.log(error);
        this.ui.showErrorSnackBar("Sbírku se nepodařilo vytvořit");
      });
  }


  onUpdate() {
    this.collectionsService.updateCollection(this.collection).subscribe(() => {
      this.ui.showInfoSnackBar("Sbírka byla upravena");
      this.router.navigate(['/collections', this.collection.id]);
    },
      (error) => {
        console.log(error);
        this.ui.showErrorSnackBar("Sbírku se nepodařilo upravit");
      });
  }


}