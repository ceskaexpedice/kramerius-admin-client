import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule, ProgressBarMode } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { Collection } from 'src/app/models/collection.model';
import { RightAction } from 'src/app/models/right-action.model';
import { AuthService } from 'src/app/services/auth.service';
import { CollectionsService } from 'src/app/services/collections.service';
import { catchError, of } from 'rxjs';
import { ClientApiService } from 'src/app/services/client-api.service';
import { CdkApiService } from 'src/app/services/cdk-api.service';
import { AppSettings } from 'src/app/services/app-settings';

interface ResolvedPid {
  inputPid: string;
  targetPid: string;
  libraryCodes: string[];
}


@Component({
    imports: [CommonModule, TranslateModule, FormsModule, MatDialogModule,
        MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatTooltipModule,
        MatProgressBarModule, MatCardModule],
    selector: 'app-add-items-to-collection-dialog',
    templateUrl: './add-items-to-collection-dialog.component.html',
    styleUrls: ['./add-items-to-collection-dialog.component.scss']
})
export class AddItemsToCollectionDialogComponent implements OnInit {

  @ViewChild('fileWithPids', { static: true }) fileWithPids: ElementRef;

  inProgress = false;

  pids: string;
  resolvedPids: ResolvedPid[] = [];
  libraryLogos: Record<string, string> = {};

  collection_title;
  collection_pid;

  progressBarMode: ProgressBarMode = 'indeterminate';
  pidsTextareaRows = 4;

  items_counter_total: number = undefined;
  items_counter_added = 0;
  items_counter_failed = 0;

  // chyby v pravech 
  rightsErrors:string[] = [];
  genericErrors: any = {};
 
  lang:string ='cze';

  constructor(public dialogRef: MatDialogRef<AddItemsToCollectionDialogComponent>, @Inject(MAT_DIALOG_DATA) public collection: Collection, 
  private collectionApi: CollectionsService,
  private authService: AuthService,
  private clientApi: ClientApiService,
  private cdkApi: CdkApiService,
  public appSettings: AppSettings
  ) {
    if (collection) {
      this.collection_title = collection.names['cze'];
      this.collection_pid = collection.id;
    }
  }

  ngOnInit() {
    if (this.appSettings.cdkMode) {
      this.cdkApi.registrinfo().subscribe({
        next: (libraries: any[]) => this.libraryLogos = Object.fromEntries(
          (Array.isArray(libraries) ? libraries : []).filter(library => library?.code && library?.logo).map(library => [library.code, library.logo])
        ),
        error: () => this.libraryLogos = {}
      });
    }
  }

  onSelectFile(event: any): void {
    //console.log('fileList', event);
    let fileReader: FileReader = new FileReader();
    fileReader.onload = (e) => {
      this.pids = String(fileReader.result);
      this.resolvePidsForPreview();
    }
    fileReader.readAsText(event.target.files[0]);
  }

  onAdd() {
    this.inProgress = true;
    const pids = this.splitPids(this.pids);
    this.items_counter_total = pids.length;

    this.rightsErrors = [];
    this.genericErrors = {};


    this.resolvedPids = [];
    pids.forEach(pid => {
      if (this.appSettings.cdkMode) {
        this.resolvePidAndAdd(pid);
      } else {
        this.addPid(pid, pid);
      }
    });
    this.progressBarMode = 'determinate';
  }

  onPidsChanged() {
    this.resolvedPids = [];
  }

  resolvePidsForPreview() {
    if (!this.appSettings.cdkMode || this.inProgress) {
      return;
    }
    this.resolvedPids = [];
    this.splitPids(this.pids).forEach(pid => this.resolvePid(pid, resolved => {
      this.resolvedPids = [...this.resolvedPids.filter(item => item.inputPid !== pid), resolved];
    }));
  }

  private resolvePidAndAdd(pid: string) {
    this.resolvePid(pid, resolved => {
      this.resolvedPids = [...this.resolvedPids.filter(item => item.inputPid !== pid), resolved];
      this.addPid(pid, resolved.targetPid);
    });
  }

  private resolvePid(pid: string, callback: (resolved: ResolvedPid) => void) {
    const lookupPid = pid.startsWith('cdk/') ? pid.substring(4) : pid;
    this.clientApi.getObjectByPidFromIndex(lookupPid).pipe(catchError(() => of(null))).subscribe(doc => {
      const libraryCodes = this.readLibraryCodes(doc?.['cdk.collection'] ?? doc?.['cdk:collection']);
      const targetPid = libraryCodes.length > 0 && !pid.startsWith('cdk/') ? `cdk/${lookupPid}` : pid;
      callback({ inputPid: pid, targetPid, libraryCodes });
    });
  }

  genericErrorsKeys() {
    return Object.keys(this.genericErrors);
  }

  private addPid(inputPid: string, targetPid: string) {
    this.authService.getAuthorizedActions(targetPid).subscribe({
      next: (actions: RightAction[]) => {
        const canAdd = actions.some(action => action.code === 'a_able_tobe_part_of_collections');
        if (!canAdd) {
          this.items_counter_failed++;
          this.rightsErrors.push(inputPid);
          this.finishIfDone();
          return;
        }

        this.collectionApi.addItemToCollection(this.collection.id, targetPid).subscribe({
          next: () => {
            this.items_counter_added++;
            this.finishIfDone();
          },
          error: error => {
            this.items_counter_failed++;
            this.genericErrors[inputPid] = error?.error?.message || error;
            this.finishIfDone();
          }
        });
      },
      error: error => {
        this.items_counter_failed++;
        this.genericErrors[inputPid] = error?.error?.message || error;
        this.finishIfDone();
      }
    });
  }

  private finishIfDone() {
    if (this.isFinished()) {
      this.inProgress = false;
    }
  }

  private readLibraryCodes(value: any): string[] {
    const values = Array.isArray(value) ? value : (typeof value === 'string' ? value.replace(/^\[|\]$/g, '').split(',') : []);
    return values.map(code => String(code).trim()).filter(code => !!code);
  }

  libraryLogo(item: ResolvedPid): string | null {
    const code = item.libraryCodes[0];
    return code ? this.libraryLogos[code] || null : null;
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
        retval += "<li>" + ge + ': ' + this.genericErrors[ge] + "</li>";
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
    return [];
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
