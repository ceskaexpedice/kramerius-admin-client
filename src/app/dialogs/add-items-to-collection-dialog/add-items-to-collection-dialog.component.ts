import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Collection } from 'src/app/models/collection.model';
import { RightAction } from 'src/app/models/right-action.model';
import { AuthService } from 'src/app/services/auth.service';
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

  // chyby v pravech 
  rightsErrors:string[] = [];
  genericErrors: {};
 
  lang:string ='cze';

  constructor(public dialogRef: MatDialogRef<AddItemsToCollectionDialogComponent>, @Inject(MAT_DIALOG_DATA) public collection: Collection, 
  private collectionApi: CollectionsService,
  private authService: AuthService
  ) {
    if (collection) {
      this.collection_title = collection.names['cze'];
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

  onAdd(formData) {
    this.inProgress = true;
    const pids = this.splitPids(this.pids);
    this.items_counter_total = pids.length;

    this.rightsErrors = [];
    this.genericErrors = {};


    pids.forEach(pid => {
      this.authService.getAuthorizedActions(pid).subscribe((rAct: RightAction[]) => {
        let authActions = [];
        rAct.forEach(rA => {
          authActions.push(rA.code);
        });
  
        if (authActions.includes('a_able_tobe_part_of_collections')) {
          //TODO: use collectionApi.addItemsToCollection instead
          this.collectionApi.addItemToCollection(this.collection.id, pid)
          .subscribe(() => {
            this.items_counter_added++;
            if (this.isFinished()) {
              this.inProgress = false;
            }
          }, response => {
            // pid
            this.items_counter_failed++;
            if (response.error && response.error.message) {
              this.genericErrors[pid]= response.error.message;
            } else {
              this.genericErrors[pid]= response;
            }

            if (this.isFinished()) {
              this.inProgress = false;
            }
          });
        } else {
          // nema prava
          // pid
          this.items_counter_failed++;
          if (this.isFinished()) {
            this.inProgress = false;
          }
          this.rightsErrors.push(pid);
        }
      });
    })
    this.progressBarMode = 'determinate';
  }

  containsGe() {
    if (this.genericErrors) {
      let rv = Object.keys(this.genericErrors).length > 0
      return rv;
  
    } else return false;
  }

  genericErrorToText() {
    let retval = '';
    if (this.genericErrors) {
      Object.keys(this.genericErrors).forEach((ge) => {
        //retval = retval +","+ ge+"("+this.genericErrors[ge]+")";
        retval = "<li>" + this.genericErrors[ge] + "</li>";
      });
    }
    return "<ul class=\"app-m-0\">" + retval + "</ul>";
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

  onCloseAfterFinished() {
    if (this.items_counter_added > 0) {
      this.dialogRef.close('added');
    } else {
      this.dialogRef.close('closed');
    }
  }

}
