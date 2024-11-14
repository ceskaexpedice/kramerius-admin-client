import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';

import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatRadioModule} from '@angular/material/radio';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from 'ngx-flexible-layout';
import { Library } from 'src/app/models/cdk.library.model';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { CdkApiService } from 'src/app/services/cdk-api.service';
import { UIService } from 'src/app/services/ui.service';

@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, FlexLayoutModule, FormsModule, MatDialogModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDividerModule, 
  MatProgressBarModule, MatTooltipModule, MatRadioModule],
  selector: 'app-schedule-re-harvest-specific-pids-dialog',
  templateUrl: './schedule-re-harvest-specific-pids-dialog.component.html',
  styleUrls: ['./schedule-re-harvest-specific-pids-dialog.component.scss']
})
export class ScheduleReHarvestSpecificPidsDialogComponent implements OnInit {

  // harvesting pids
  pids: string;
  // type of reharvest 'root' | 'children' | 'new_root'
  typeOfHarvest:string = 'children';
  // rehaversting libs options 'all from index' | 'selected from checkbox'
  reharvestLibsOption: string = "fromindex";
  
  // library options
  options: Array<{ library:Library, selected: boolean, enabled:boolean }> = [];

  constructor(
    public adminApi: AdminApiService,
    public cdkApi : CdkApiService,
    private ui: UIService,
    public dialogRef: MatDialogRef<ScheduleReHarvestSpecificPidsDialogComponent>) { }

  ngOnInit(): void {

    this.cdkApi.connected().subscribe(resp=> {
      this.options = [];
      resp.forEach(it=> {
        this.options.push({library:it, selected:false, enabled:it.status});
      });
    });

  }

  onTypeOfReharvestChanged(event: any) {
    if (this.typeOfHarvest === 'new_root') {
      if (this.reharvestLibsOption !== 'selection') {
        this.reharvestLibsOption = 'selection';
        this.reloadLibsOptions();
      }
    }
  }

  onReharvestLibsOptionChange(event: any) {
    if (event.value === 'selection') {
      this.reloadLibsOptions();
    }
  }

  reloadLibsOptions() {
    this.options.forEach(option =>{   
      if (option.enabled) {
        option.selected = true
      } else {
        option.selected = false
      }
    });
  }  

  schedule() {
    const pidlist = this.splitPids(this.pids);
    pidlist.forEach(pid=> {
        if (this.reharvestLibsOption == 'selection') {

          let libs:string[] = [];
          this.options.forEach(option=> {
            if (option.selected) {
              libs.push(option.library.code);
            }
          });


          let object: any = {
            name:'User trigger | Reharvest from admin client ',
            pid:pid,
            type: this.typeOfHarvest,
            libraries: libs
          };

          if (this.typeOfHarvest == 'new_root') {
            object['root.pid'] = pid
          }

          this.cdkApi.planReharvest(object).subscribe(
            res=> {
              this.dialogRef.close(res);
            },
            error => {
              this.dialogRef.close('error');
            }
          );

        } else {
          this.cdkApi.planReharvest({name:'User trigger - reharvest from admin client',pid:pid,type: this.typeOfHarvest}).subscribe(
            res=> {
              this.dialogRef.close(res);
            },
            error => {
              this.dialogRef.close('error');
            }
          );
        }
    });
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
}
