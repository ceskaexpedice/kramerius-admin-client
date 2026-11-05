import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Inject, Optional } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import {MatCheckboxModule} from '@angular/material/checkbox';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { TranslateModule } from '@ngx-translate/core';

import { Library } from 'src/app/models/cdk.library.model';
import { CdkApiService } from 'src/app/services/cdk-api.service';
import { UIService } from 'src/app/services/ui.service';
import { debounceTime, Subject, from, concatMap, toArray } from 'rxjs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';

@Component({
    imports: [
        CommonModule, TranslateModule, MatDialogModule, MatCheckboxModule,
        MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatDividerModule,
        MatProgressBarModule, MatRadioModule, FormsModule, MatExpansionModule, MatCardModule
    ],
    selector: 'app-schedule-re-harvest-specific-pids-dialog',
    templateUrl: './schedule-re-harvest-specific-pids-dialog.component.html',
    styleUrls: ['./schedule-re-harvest-specific-pids-dialog.component.scss']
})
export class ScheduleReHarvestSpecificPidsDialogComponent implements OnInit {

  isLibsLoading: boolean = false;  // nahrava seznam ve kterych knihovnach se titul nachazi
  isProcessRunning = false;
  reharvestingDisabled = false; // znemozneny standardni reharvest
  selectedCount = 0; // v kolika knihovnach byl titul nalezen

  conflict = false; // zda se jedna o konflikt - rozdil modelu 
  conflictMessage = "";
  conflictAlternatives:any[] = [];
  // stored in cdk index 
  cdkIndex:any;

  // library options
  options: Array<{ library: Library, selected: boolean, enabled: boolean, doc:any }> = [];



  // harvesting pids
  pids: string;
  typeOfHarvest: string = 'children';
  reharvestLibsOption: string = "fromindex";
  processOptions: {
    onlyShowConfiguration: boolean;
    maxItemsToDelete: string | null;
  } = {
    onlyShowConfiguration: false,
    maxItemsToDelete: null
  };
  root_pids:string[] = [];
  pid_paths:string[] = [];
  private ownPidPathsByPid: Record<string, string> = {};

  // Debouncing 
  private subject: Subject<string> = new Subject();
  private lookupVersion = 0;




  constructor(
    public cdkApi: CdkApiService,
    private ui: UIService,
    public dialogRef: MatDialogRef<ScheduleReHarvestSpecificPidsDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private data: { pids?: string; reharvestItemId?: string } | null) { }

  ngOnInit(): void {

    this.cdkApi.connected().subscribe(resp => {
      this.options = [];
      resp.forEach(it => {
        this.options.push({ library: it, selected: false, enabled: it.status, doc:null });
      });
    });


    this.subject.pipe(
      debounceTime(400)
    ).subscribe(pids => {
      const lookupVersion = this.lookupVersion;
      if (!pids.trim()) {
        this.isLibsLoading = false;
        return;
      }
      this.isLibsLoading = true;
      this.options.forEach(opt=> {
        opt.selected = false;
        opt.doc = null;
      });
      const pidlist = this.splitPids(pids);
      let rootpids: string[] = [];
      let pidpaths:string[] = [];
      let enabled: string[] = [];
      let fdocs: Record<string, any[]> = {};

      for (let i = 0; i < pidlist.length; i++) {
        this.cdkApi.introspectPid(pidlist[i]).subscribe(resp => {
          // Ignore results from an older PID lookup that completed late.
          if (lookupVersion !== this.lookupVersion) return;

          let keys = Object.keys(resp);
          for (let j = 0; j < keys.length; j++) {
            let key = keys[j];
            let numFound = resp[key]['response']['numFound'];
            if (numFound > 0) {
              let docs = resp[key]['response']['docs'];
              if (docs && docs.length > 0) {

                let rp = docs[0]['root.pid'];
                let pp = docs[0]['pid_paths'];
                const ownPidPath = docs[0]['own_pid_path'];
                rootpids.push(rp);

                if (pp && pp.length > 0) {
                  pidpaths.push(pp[0])
                } else {
                  pidpaths.push(rp)
                }
                if (ownPidPath) this.ownPidPathsByPid[pidlist[i]] = ownPidPath;
                fdocs[key]= docs;
              }
              enabled.push(key);
            }
          }

          // store cdk instance
          this.cdkIndex = fdocs['_cdk_'];
          this.root_pids = rootpids;
          this.pid_paths = pidpaths;

          let uniqueCardinality: number = new Set(rootpids).size;
          if (uniqueCardinality) {
            if (rootpids[0] === pidlist[i]) {
              this.typeOfHarvest = this.cdkIndex ?  'root' : 'new_root';
              this.reharvestLibsOption = 'selection';
            } else {
              this.typeOfHarvest = 'children';
              this.reharvestLibsOption = 'selection';
            }
            this.options.forEach(opt => {
              let selected = enabled.indexOf(opt.library.code) >= 0;
              opt.selected = selected;
              if (fdocs[opt.library.code]) {
                opt.doc = fdocs[opt.library.code][0];
              }
            });
          } else {
            // conflict
            // reharvest korenoveho titulu
          }

          // check model conflict
          let modelConflict = this.modelConflict();
          if (modelConflict[0]) {
            this.conflict = modelConflict[0];
            this.conflictMessage = modelConflict[1];
            this.conflictAlternatives = modelConflict[2];
          }

          // check cdk conflict
          let cdkConflict = this.cdkConflict(fdocs['_cdk_']);          
          if (cdkConflict[0]) {
            this.conflict = cdkConflict[0];
            this.conflictMessage = cdkConflict[1];
            this.conflictAlternatives = cdkConflict[2];
          }

          // A PID can exist in the CDK index without being present in any
          // connected library. Keep the operation types available in that
          // case; the user can choose the target libraries manually.
          this.reharvestingDisabled = (this.selectedCount < 1 && !this.cdkIndex) || this.conflict;

          let libs: string[] = [];
          this.options.forEach(option => {
            if (option.selected) {
              libs.push(option.library.code);
            }
          });

          this.isLibsLoading = false;
        });
      }

    });

    // Subscribe before emitting the dialog's initial PID so the debounced
    // introspection lookup is not lost during initialization.
    if (this.data?.pids) {
      this.onPidsChange(this.data.pids);
    }

  }

  onTypeOfReharvestChanged(event: any) {
    if (this.typeOfHarvest === 'new_root') {
      if (this.reharvestLibsOption !== 'selection') {
        this.reharvestLibsOption = 'selection';
      }
    }

    if (this.typeOfHarvest === 'delete_pid' || this.typeOfHarvest === 'delete_tree') {
      this.reharvestLibsOption = 'fromindex';
    }
  }

  onPidsChange(newPidsValue: string): void {
    this.pids = newPidsValue;
    this.lookupVersion++;
    // Clear results for the previous PID immediately, before the debounced
    // introspection starts. Otherwise a conflict remains visible while the
    // user is entering a different PID (or clears the field).
    this.resetLookupState();
    this.isLibsLoading = !!newPidsValue?.trim();
    this.subject.next(newPidsValue || '');
  }

  private resetLookupState(): void {
    this.conflict = false;
    this.conflictMessage = '';
    this.conflictAlternatives = [];
    this.selectedCount = 0;
    this.reharvestingDisabled = false;
    this.cdkIndex = null;
    this.root_pids = [];
    this.pid_paths = [];
    this.ownPidPathsByPid = {};
    this.options.forEach(option => {
      option.selected = false;
      option.doc = null;
    });
  }
  
  onReharvestLibsOptionChange(event: any) {
    if (event.value === 'selection') {
      this.reloadLibsOptions();
    }
  }

  reloadLibsOptions() {
    this.options.forEach(option => {
      if (option.enabled) {
        option.selected = true
      } else {
        option.selected = false
      }
    });
  }  

  schedule() {
    this.runReharvestProcess();
  }

  runReharvestProcess(): void {
    const isDelete = this.typeOfHarvest.startsWith('delete_');
    const libraries = isDelete ? [] : this.options
      .filter(option => option.selected && option.enabled)
      .map(option => option.library.code);
    const libraryList = libraries.join(',');
    const requests = this.splitPids(this.pids).map(pid => {
      const request: any = { pid, type: this.typeOfHarvest };
      request.own_pid_path = this.ownPidPathsByPid[pid] || pid;
      const rootPid = this.root_pids[0] || (this.typeOfHarvest === 'new_root' || this.typeOfHarvest === 'delete_root' ? pid : '');
      if (rootPid) request.rootPid = rootPid;

      request.onlyShowConfiguration = this.processOptions.onlyShowConfiguration;
      if (this.processOptions.maxItemsToDelete != null && this.processOptions.maxItemsToDelete !== '') {
        request.maxItemsToDelete = this.processOptions.maxItemsToDelete;
      }
      if (this.data?.reharvestItemId) {
        request.reharvestItemId = this.data.reharvestItemId;
        request.successState = 'closed';
      }

      return { libraries: libraryList, request };
    });

    if (!requests.length) return;
    this.isProcessRunning = true;
    from(requests).pipe(
      concatMap(({ libraries, request }) => this.cdkApi.runCdkReharvestProcess(libraries, request)),
      toArray()
    ).subscribe({
      next: result => this.dialogRef.close(result),
      error: () => this.dialogRef.close('error')
    });
  }

  cdkConflict(docs: any[]): [boolean, string,any[]] {
    let conflict =  docs?.length > 1;
    let message = this.ui.getTranslation('desc.cdkconflict')
  
    let _to_delete :any[]= [];
    let _to_reharvets:any[]=[];
    
    docs?.forEach(doc=> {
      let deleteObject: any = {
        name: 'User trigger | Reharvest from admin client ',
        pid: doc['root.pid'],
        type: 'delete_tree'
      };
      if (!this.cdkIndex && this.pid_paths.length > 0) {
        deleteObject['own_pid_path']=this.pid_paths[0];
      }
      _to_delete.push(deleteObject);
  
      let reharvestObject: any = {
        name: 'User trigger | Reharvest from admin client ',
        pid: doc['root.pid'],
        type: 'root'
      };
      if (!this.cdkIndex && this.pid_paths.length > 0) {
        reharvestObject['own_pid_path']=this.pid_paths[0];
      }
      _to_reharvets.push(reharvestObject);
    });
    
    
    return [conflict, message, [..._to_delete]];
  }


  private modelConflict(): [boolean, string, any[]] {
    let selected = this.options.filter(o => o.selected);
    let models = selected.map(o => o.doc['model']);
    this.selectedCount = selected.length;
    // No library may be selected when a PID exists only in the _cdk_ index.
    // An empty model list is not a model conflict and must not hide the
    // operation controls in the dialog.
    if (models.length === 0) {
      return [false, '', []];
    }
    let modelConflict = new Set(models).size !== 1;
    
    let modelName = models.length > 0 ? models[0] : "";

    return [modelConflict, modelName,[]];
}

summary() {
  if (this.selectedCount > 0) {
    return  this.ui.getTranslation('alert.cdkReharvestSpecificPids.result', { value: this.selectedCount}) + '. ' + this.ui.getTranslation(this.conflict ? 'desc.conflict' : 'desc.noConflict') + '.';
  } else {
    return this.ui.getTranslation('alert.cdkReharvestSpecificPids.result', { value: this.selectedCount}) + '.';
  }
 }

  /** return detail message */
  detailDoc(key:string, obj:any) {
    if (obj) {
      let strings:string[] = [];
  
      let rootpid = obj['root.pid'];
      let pid = obj['pid'];
      strings.push(rootpid === pid ? 'Kořenový titul' : 'Část celku');
  
      if (obj['model']) {
        strings.push(`model ${obj['model']}`);
      }
  
      return "Nalezeno ->  "+ strings.join(', ');
    } else return ""; 
  
   }
   detail(key:string):string {
  
      let detail = this.options.find(o=> o.library.code === key);
      if (detail) {
       let obj = detail.doc;
        return this.detailDoc(key, obj);
      } else return "";
    }

  splitPids(pids: string): string[] {
    if (pids) {
      return pids
        // Accept copied values such as "PID: uuid:..." without treating
        // the label itself as another PID and scheduling an extra process.
        .replace(/\bPID\s*:\s*/gi, ' ')
        .split(/[\s,;]+/) //split by white spaces, ',', ';'
        .filter(n => n); //remove empty strings
    } else return [pids];
  }
}
