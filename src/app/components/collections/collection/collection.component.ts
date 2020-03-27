import { Component, OnInit } from '@angular/core';
import { Collection } from 'src/app/models/collection.model';
import { ActivatedRoute, Router } from '@angular/router';
import { UIService } from 'src/app/services/ui.service';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { MatDialog } from '@angular/material';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { CollectionsService } from 'src/app/services/collections.service';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss']
})
export class CollectionComponent implements OnInit {

  collection: Collection;
  state = 'none';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ui: UIService,
    private dialog: MatDialog,
    private collectionsService: CollectionsService) {
  }

  ngOnInit() {
    this.state = 'loading';
    this.route.params.subscribe(params => {
      this.collectionsService.getCollection(params['id']).subscribe((collection: Collection) => {
        this.collection = collection;
        this.state = 'success';
      });
    });
  }

  onDelete() {
    if (!this.collection) {
      return;
    }
    const data: SimpleDialogData = {
      title: "Smazání sbírky",
      message: "Opravdu chcete sbírku trvale smazat?",
      btn1: {
        label: 'Ano',
        value: 'yes',
        color: 'warn'
      },
      btn2: {
        label: 'Ne',
        value: 'no',
        color: 'default'
      }
    };
    const dialogRef = this.dialog.open(SimpleDialogComponent, { data: data });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.collectionsService.deleteCollection(this.collection).subscribe(result => {
          this.ui.showInfoSnackBar("Sbírka byla odstraněna")
          this.router.navigate(['/collections']);
        },
          (error) => {
            console.log('error');
            this.ui.showErrorSnackBar("Sbírku se nepodařilo odstranit")
          });
      }
    });
  }


}