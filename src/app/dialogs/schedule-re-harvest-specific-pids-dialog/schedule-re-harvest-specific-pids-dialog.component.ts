import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
import { FlexLayoutModule } from 'ngx-flexible-layout';
import { Library } from 'src/app/models/cdk.library.model';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { CdkApiService } from 'src/app/services/cdk-api.service';
import { UIService } from 'src/app/services/ui.service';
import { debounceTime, Subject } from 'rxjs';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';

@Component({
  standalone: true,
  imports: [
    CommonModule, TranslateModule, FlexLayoutModule,  MatDialogModule, MatCheckboxModule,
    MatButtonModule, MatIconModule,  MatInputModule, MatSelectModule, MatDividerModule,
    MatProgressBarModule, MatTooltipModule, MatRadioModule, FormsModule, MatProgressBarModule, MatAccordion, MatExpansionModule, MatCardModule],
  selector: 'app-schedule-re-harvest-specific-pids-dialog',
  templateUrl: './schedule-re-harvest-specific-pids-dialog.component.html',
  styleUrls: ['./schedule-re-harvest-specific-pids-dialog.component.scss']
})
export class ScheduleReHarvestSpecificPidsDialogComponent implements OnInit {

  isLibsLoading: boolean = false;  // nahrava seznam ve kterych knihovnach se titul nachazi
  reharvestingDsiabled = false;
  selectedCount = 0; // v kolika knihovnach byl titul nalezen
  conflict = false; // zda se jedna o konflikt - rozdil modelu 

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
      let enabled: string[] = [];
      let fdocs:any = {}

      for (let i = 0; i < pidlist.length; i++) {
        this.cdkApi.introspectPid(pidlist[i]).subscribe(resp => {


          let keys = Object.keys(resp);
          for (let j = 0; j < keys.length; j++) {
            let key = keys[j];
            let numFound = resp[key]['response']['numFound'];
            if (numFound > 0) {
              let docs = resp[key]['response']['docs'];
              if (docs && docs.length > 0) {
                rootpids.push(docs[0]['root.pid']);
                
                fdocs[key]= docs[0];
              }
              enabled.push(key);
            }
          }

          // store cdk instance
          this.cdkIndex = fdocs['_cdk_'];

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
              opt.doc = fdocs[opt.library.code];
            });
          } else {
            // conflict
            // reharvest korenoveho titulu

          }

          
          let selected = this.options.filter(o=> o.selected);
          let models = selected.map(o=> o.doc['model']);
          this.selectedCount = selected.length;
          this.conflict = new Set(models).size != 1;
          this.reharvestingDsiabled = this.selectedCount <1 || this.conflict;

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

 summary() {
  if (this.selectedCount > 0) {
    return `Nalezeno v ${this.selectedCount} knihovnách; ${this.conflict  ? 'Konflikt' : 'Žádný konflikt'}`
  } else {
    return `Nalezeno v ${this.selectedCount} knihovnách`
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

    console.log(obj);

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
    //this.details = {};
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

        if (this.typeOfHarvest == 'new_root') {
          object['root.pid'] = pid
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
