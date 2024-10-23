import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Library } from 'src/app/models/cdk.library.model';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { CdkApiService } from 'src/app/services/cdk-api.service';
import { UIService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-schedule-re-harvest-specific-pids-dialog',
  templateUrl: './schedule-re-harvest-specific-pids-dialog.component.html',
  styleUrls: ['./schedule-re-harvest-specific-pids-dialog.component.scss']
})
export class ScheduleReHarvestSpecificPidsDialogComponent implements OnInit {

  isLibsLoading:boolean = false;

  // harvesting pids
  pids;
  // type of reharvest 'root' | 'children' | 'new_root'
  typeOfHarvest:string = 'children';
  // rehaversting libs options 'all from index' | 'selected from checkbox'
  reharvestLibsOption: string = "fromindex";
  
    
  // Debouncing 
  private subject: Subject<string> = new Subject();


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

    this.subject.pipe(
      debounceTime(400)
    ).subscribe(pids => {
      this.isLibsLoading = true;
      const pidlist = this.splitPids(pids);
      let rootpids:string[] = [];      
      let enabled:string[] = [];

      for (let i = 0;i<pidlist.length;i++) {
        this.cdkApi.introspectPid(pidlist[i]).subscribe(resp=> {
          let keys  = Object.keys(resp);
          for(let j=0;j<keys.length;j++) {
            let key = keys[j]
            let numFound = resp[key]['response']['numFound'];          
            if (numFound > 0) {
              let docs = resp[key]['response']['docs'];
              if (docs && docs.length > 0) {
                rootpids.push(docs[0]['root.pid']);
              }
              enabled.push(key);
            } 
          }


          let uniqueCardinality: number = new Set(rootpids).size;
          if (uniqueCardinality) {
            if (rootpids[0] === pidlist[i]) {
              this.typeOfHarvest = 'root';
              this.reharvestLibsOption = 'selection';
            } else {
              this.typeOfHarvest = 'children';
              this.reharvestLibsOption = 'selection';
            }
            this.options.forEach(opt=> {
              let selected = enabled.indexOf(opt.library.code) >= 0;
              opt.selected = selected;
            });
          } else {
            // conflict
          }

          this.isLibsLoading = false;
        });
      }

    });
  }

  onPidsChange(newPidsValue: string): void {
    this.pids = newPidsValue;
    if (newPidsValue) {
      //this.options.forEach(it=> it.selected=true)
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
    this.options.forEach(option =>{   
      if (option.enabled) {
        option.selected = true
      } else {
        option.selected = false
      }
    });
  }  



  schedule(formData) {

    const pidlist = this.splitPids(this.pids);
    /*
    pidlist.forEach(pid=> {
      this.cdkApi.introspectPid(pid).subscribe(response=> {
        let keys = Object.keys(response);
        keys.forEach(k=> {
          let numFound = response[k]['response']['numFound'];

        });
      });
    });
    */

    pidlist.forEach(pid=> {
        if (this.reharvestLibsOption == 'selection') {

           let libs:string[] = [];

          this.options.forEach(option=> {
            if (option.selected) {
              libs.push(option.library.code);
            }
          });

          let object = {
            name:'User trigger | Reharvest from admin client ',
            pid:pid,
            type: this.typeOfHarvest,
            libraries:libs
          };

          if (this.typeOfHarvest == 'new_root') {
            object['root.pid'] = pid
          }

          if (libs.length > 0) {
            this.cdkApi.planReharvest(object).subscribe(
              res=> {
                this.dialogRef.close(res);
              },
              error => {
                this.dialogRef.close('error');
              }
            );
          }
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
  }
}
