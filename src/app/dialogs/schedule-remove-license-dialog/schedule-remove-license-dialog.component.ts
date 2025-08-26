import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule, ProgressBarMode } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { License } from 'src/app/models/license.model';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { debounceTime, Subject, switchMap, takeUntil } from 'rxjs';
import { ClientApiService } from 'src/app/services/client-api.service';
import { HttpParams } from '@angular/common/http';

@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, MatDialogModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule,
  MatProgressBarModule, MatTooltipModule],
  selector: 'app-schedule-remove-license-dialog',
  templateUrl: './schedule-remove-license-dialog.component.html',
  styleUrls: ['./schedule-remove-license-dialog.component.scss']
})
export class ScheduleRemoveLicenseDialogComponent implements OnInit {

  @ViewChild('fileWithPids', { static: true }) fileWithPids: ElementRef;

  inProgress = false;

  pids;
  title;
  fixed = false;

  /** all licenses used for pids  */
  allUSedLicenses:string[] = [];

  licenses;
  license;

  pidsCounter = 0;
  scheduledCounter = 0;
  progressBarMode: ProgressBarMode = 'indeterminate';


  private pidsChanged$ = new Subject<string>();


  constructor(public dialogRef: MatDialogRef<ScheduleRemoveLicenseDialogComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: any,
     private adminApi: AdminApiService,
    private clientApi: ClientApiService) {
    if (data) {
    
      this.fixed = true;
      this.pids = data.pid;
      this.title = data.title;
      this.license = data.license;
      this.licenses = data.licenses;
    } else {
      this.fetchAvailableLicenses();
    }

    //     this.subject.pipe(
    //   debounceTime(400)
    // ).subscribe(pids => {
    //   this.isLibsLoading = true;
    //   this.options.forEach(opt=> {
    //     opt.selected = false;
    //     opt.doc = null;
    //   });
    //   const pidlist = this.splitPids(pids);
    //   let rootpids: string[] = [];
    //   let pidpaths:string[] = [];
    //   let enabled: string[] = [];
    //   let fdocs: Record<string, any[]> = {};



    this.pidsChanged$
      .pipe(
        debounceTime(500)
      )
      .subscribe((pidsString) => {
        this.getLicensesForPids(pidsString);
        //console.log("Licenses ... ");
      });

  }

  fetchAvailableLicenses() {
    this.inProgress = true;
    this.adminApi.getAllLicenses(false).subscribe((licenses: License[]) => {
      //this.licenses = licenses.map((lic) => lic.name);
      this.license = licenses[0];

      let tmpLicenses =  licenses;
      let globalLicenses = tmpLicenses.filter(lic=> lic.group !='local'); 
      let localLicenses = tmpLicenses.filter(lic=> lic.group =='local');

      this.licenses = globalLicenses.concat(localLicenses);

      this.inProgress = false;
    });
  }

  ngOnInit() {
  }

  schedule() {
    this.inProgress = true;
    const pidlist = this.splitPids(this.pids);
    const license = this.license; //formData.license;
    this.adminApi.scheduleProcess({
      defid: 'remove_license',
      params: {
        license: license,
        pidlist: pidlist.length == 1 ? undefined : pidlist,
        pid: pidlist.length == 1 ? pidlist[0] : undefined,
      }
    }).subscribe(response => {
      this.dialogRef.close("scheduled");
    }, error => {
      console.log(error);
      this.dialogRef.close('error');
    });
  }

  splitPids(pids: string) {
    //uuid:123 uuid:456,uuid:789;uuid:012, uuid:345; uuid:678    uuid:901
    //uuid:123 uuid:456,uuid:789;uuid:012, uuid:345; uuid:678    uuid:901 xxx
    if (pids) {
      return pids
        .split(/[\s,;]+/) //split by white spaces, ',', ';'
        .filter(n => n); //remove empty strings
    } else {
      return [];
    }
  }

  getProgress() {
    return Math.floor(this.scheduledCounter / this.pidsCounter * 100);
  }

  onSelectFile(event: any): void {
    //console.log('fileList', event);
    let fileReader: FileReader = new FileReader();
    fileReader.onload = (e) => {
      this.pids = String(fileReader.result);
    }
    fileReader.readAsText(event.target.files[0]);
  }

  onPidsFromFile() {
    let el: HTMLElement = this.fileWithPids.nativeElement;
    el.click();
  }

  onPidsChanged(pids: string) {
    this.pidsChanged$.next(pids);
  }

  isValid() {
    //return form.valid //nefunguje, kdyz je textarea disabled (protoze fixed)
    return this.pids && this.license;
  }

  getLicensesForPids(pidsString:string): any {

    this.allUSedLicenses = [];

    let pids = this.splitPids(pidsString);
    const query = pids.map(pid => `pid:"${pid}"`).join(' OR ');

    let params:HttpParams = new HttpParams()
    .set('q', query)
    .set('rows', pids.length.toString())
    .set('fl', 'pid, licenses');
    
    this.clientApi.search(params).subscribe(docs => {
      console.log(docs);
      docs.forEach(doc=> {
        let doclicenses = doc['licenses'];
        this.allUSedLicenses = Array.from(new Set([...this.allUSedLicenses, ...doclicenses]));  

        this.licenses.sort((a:any, b:any) => {
          const aUsed = this.allUSedLicenses.includes(a.name) ? 0 : 1;
          const bUsed = this.allUSedLicenses.includes(b.name) ? 0 : 1;
          return aUsed - bUsed;
        });
      });
    });
    
    //this.clientApi.search
  }


}


