import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Collection } from 'src/app/models/collection.model';
import { CollectionsService } from 'src/app/services/collections.service';


@Component({
  selector: 'app-add-items-to-collection-dialog',
  templateUrl: './add-items-to-collection-dialog.component.html',
  styleUrls: ['./add-items-to-collection-dialog.component.scss']
})
export class AddItemsToCollectionDialogComponent implements OnInit {

  @ViewChild('fileWithPids', { static: true }) fileWithPids: ElementRef;

  inProgress = false;

  pids;

  collection_title;
  collection_pid;

  progressBarMode = 'indeterminate';
  pidsTextareaRows = 4;

  items_counter_total = undefined;
  items_counter_added = 0;
  items_counter_failed = 0;

  constructor(public dialogRef: MatDialogRef<AddItemsToCollectionDialogComponent>, @Inject(MAT_DIALOG_DATA) public collection: Collection, private collectionApi: CollectionsService) {
    if (collection) {
      this.collection_title = collection.name_cze;
      this.collection_pid = collection.id;
    }
  }

  ngOnInit() {
  }

  onSelectFile(event: any): void {
    //console.log('fileList', event);
    let fileReader: FileReader = new FileReader();
    fileReader.onload = (e) => {
      this.pids = String(fileReader.result);
    }
    fileReader.readAsText(event.target.files[0]);
  }

  schedule(formData) {
    this.inProgress = true;
    const pids = this.splitPids(this.pids);
    this.items_counter_total = pids.length;
    pids.forEach(pid => {
      this.collectionApi.addItemToCollection(this.collection.id, pid)
        .subscribe(() => {
          this.items_counter_added++;
          if (this.isFinished()) {
            this.inProgress = false;
          }
        }, error => {
          this.items_counter_failed++;
          console.log(error);
          if (this.isFinished()) {
            this.inProgress = false;
          }
        });
    })
    this.progressBarMode = 'determinate';
  }

  splitPids(pids: string) {
    //uuid:123 uuid:456,uuid:789;uuid:012, uuid:345; uuid:678    uuid:901
    //uuid:123 uuid:456,uuid:789;uuid:012, uuid:345; uuid:678    uuid:901 xxx
    if (pids) {
      return pids
        .split(/[\s,;]+/) //split by white spaces, ',', ';'
        .filter(n => n); //remove empty strings
    }
  }

  onPidsFromFile() {
    if (!this.inProgress && !this.isFinished()) {
      let el: HTMLElement = this.fileWithPids.nativeElement;
      el.click();
    }
  }

  getProgress() {
    return Math.floor((this.items_counter_added + this.items_counter_failed) / this.items_counter_total * 100);
  }

  isFinished() {
    return !!this.items_counter_total && (this.items_counter_added + this.items_counter_failed) == this.items_counter_total;
  }

}
