import { CommonModule } from '@angular/common';
import { Component, model, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import {MatCheckboxModule} from '@angular/material/checkbox';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { TranslateModule } from '@ngx-translate/core';

import { Library } from 'src/app/models/cdk.library.model';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { CdkApiService } from 'src/app/services/cdk-api.service';
import { UIService } from 'src/app/services/ui.service';
import { debounceTime, Subject } from 'rxjs';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { forkJoin, from, concatMap, toArray  } from 'rxjs';

@Component({
  standalone: true,
  imports: [
    CommonModule, TranslateModule,  MatDialogModule, MatCheckboxModule,
    MatButtonModule, MatIconModule,  MatInputModule, MatSelectModule, MatDividerModule,
    MatProgressBarModule, MatTooltipModule, MatRadioModule, FormsModule, MatProgressBarModule, MatAccordion, MatExpansionModule, MatCardModule],
  selector: 'app-schedule-re-harvest-specific-pids-dialog',
  templateUrl: './schedule-re-harvest-specific-pids-dialog.component.html',
  styleUrls: ['./schedule-re-harvest-specific-pids-dialog.component.scss']
})
export class ScheduleReHarvestSpecificPidsDialogComponent implements OnInit {

  isLibsLoading: boolean = false;  // nahrava seznam ve kterych knihovnach se titul nachazi
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
  // type of reharvest 'root' | 'children' | 'new_root'
  typeOfHarvest: string = 'children';
  // rehaversting libs options 'all from index' | 'selected from checkbox'
  reharvestLibsOption: string = "fromindex";
  root_pids:string[] = [];
  pid_paths:string[] = [];

  // Debouncing 
  private subject: Subject<string> = new Subject();



  constructor(
    public adminApi: AdminApiService,
    public cdkApi: CdkApiService,
    private ui: UIService,
    public dialogRef: MatDialogRef<ScheduleReHarvestSpecificPidsDialogComponent>) { }

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
      this.isLibsLoading = true;
      this.options.forEach(opt=> {
        opt.selected = false;
        opt.doc = null;
      });
      const pidlist = this.splitPids(pids);
      let rootpids: string[] = [];
      let pidpaths:string[] = [];
      let enabled: string[] = [];
      //let fdocs:any = {}
      let fdocs: Record<string, any[]> = {};


      for (let i = 0; i < pidlist.length; i++) {
        this.cdkApi.introspectPid(pidlist[i]).subscribe(resp => {


          let keys = Object.keys(resp);
          for (let j = 0; j < keys.length; j++) {
            let key = keys[j];
            let numFound = resp[key]['response']['numFound'];
            if (numFound > 0) {
              let docs = resp[key]['response']['docs'];
              if (docs && docs.length > 0) {

                let rp = docs[0]['root.pid'];
                let pp = docs[0]['pid_paths'];
                rootpids.push(rp);

                if (pp && pp.length > 0) {
                  pidpaths.push(pp[0])
                } else {
                  pidpaths.push(rp)
                }
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

          this.reharvestingDisabled = this.selectedCount <1 || this.conflict;

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
 }

 cdkConflict(docs: any[]): [boolean, string,any[]] {
  let conflict = docs.length > 1;
  let message = this.ui.getTranslation('desc.cdkconflict')

  let _to_delete :any[]= [];
  let _to_reharvets:any[]=[];
  
  docs.forEach(doc=> {
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
    let modelConflict = new Set(models).size !== 1;
    
    // Určení modelu, pokud existuje, jinak prázdný řetězec
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

  enabledOptions() {
    return this.options.filter(o=>o.enabled);
  }

  onPidsChange(newPidsValue: string): void {
    this.pids = newPidsValue;
    if (newPidsValue) {
      this.isLibsLoading = true;
      this.subject.next(this.pids);
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
    if (!this.conflict) {
      this.scheduleRegular();
    } else {
      this.scheduleAlternatives();
    }
  }

  scheduleAlternatives() {
    if (this.conflictAlternatives) {

      from(this.conflictAlternatives).pipe(
        concatMap(doc => this.cdkApi.planReharvest(doc)), 
        toArray() 
      ).subscribe(
        res => {
          this.dialogRef.close(res); 
        },
        error => {
          this.dialogRef.close('error'); 
        }
      );

    } else {
      this.dialogRef.close('error'); 
    }

  }


  scheduleRegular() {
    const pidlist = this.splitPids(this.pids);
    pidlist.forEach(pid => {
      if (this.reharvestLibsOption == 'selection') {

        let libs: string[] = [];

        this.options.forEach(option => {
          if (option.selected) {
            libs.push(option.library.code);
          }
        });

        let object: any = {
          name: 'User trigger | Reharvest from admin client ',
          pid: pid,
          type: this.typeOfHarvest,
          libraries: libs
        };


        // new root
        if (this.typeOfHarvest == 'new_root') {
          object['root.pid'] = pid
        }

        if (!this.cdkIndex && this.pid_paths.length > 0) {
          object['own_pid_path']=this.pid_paths[0];
        }


        if (libs.length > 0) {
          this.cdkApi.planReharvest(object).subscribe(
            res => {
              this.dialogRef.close(res);
            },
            error => {
              this.dialogRef.close('error');
            }
          );
        }
      } else {
        this.cdkApi.planReharvest({ name: 'User trigger - reharvest from admin client', pid: pid, type: this.typeOfHarvest }).subscribe(
          res => {
            this.dialogRef.close(res);
          },
          error => {
            this.dialogRef.close('error');
          }
        );
      }
    });
  }


  splitPids(pids: string): string[] {
    if (pids) {
      return pids
        .split(/[\s,;]+/) //split by white spaces, ',', ';'
        .filter(n => n); //remove empty strings
    } else return [pids];
  }
}
