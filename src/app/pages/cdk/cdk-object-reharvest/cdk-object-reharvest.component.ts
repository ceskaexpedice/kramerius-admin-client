import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { debounceTime, Subject } from 'rxjs';
import { ScheduleReHarvestSpecificPidsDialogComponent } from 'src/app/dialogs/schedule-re-harvest-specific-pids-dialog/schedule-re-harvest-specific-pids-dialog.component';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { Reharvest } from 'src/app/models/cdk.library.model';
import { AppSettings } from 'src/app/services/app-settings';
import { CdkApiService } from 'src/app/services/cdk-api.service';
import { UIService } from 'src/app/services/ui.service';
import { Clipboard } from '@angular/cdk/clipboard';


/**
 * Reharvests component, displaying and manage reharvets 
 */
@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, MatChipsModule, 
    MatFormFieldModule,  MatInputModule,
    MatIconModule, 
    MatInputModule,
    FormsModule,
    MatTooltipModule, MatTableModule, MatButtonModule, MatCardModule, MatPaginatorModule, MatProgressBarModule
  ],
  selector: 'app-cdk-object-reharvest',
  templateUrl: './cdk-object-reharvest.component.html',
  styleUrls: ['./cdk-object-reharvest.component.scss']
})
export class CdkObjectReharvestComponent implements OnInit {

  /** Table columns */
  displayedColumns: string[] = [
    'date', 'pid', 'code', 'type', 'state', 'pod', 'description', 'approve', 'cancel', 'delete'
  ];
  /** Datasource for table */
  dataSource: Reharvest[];

  /** Paging properties */
  length = 50;
  pageSize = 50;
  pageIndex = 0;
  pageSizeOptions = [50, 100, 200];

  /** loading flag */
  loading = false;

  // filters
  filters:string[] = [];
  pid:string;

  // Debouncing 
  private subject: Subject<string> = new Subject();
  

  constructor(
    private dialog: MatDialog,
    private ui: UIService,
    private cdkApi: CdkApiService,
    private appSettings: AppSettings,
    private clipboard: Clipboard
  ) { }

  ngOnInit(): void {
    this.subject.pipe(
      debounceTime(400)
    ).subscribe(searchTextValue => {
      this.pid = searchTextValue;
      this.reloadReharvests();
    });

    this.reloadReharvests();
  }



  handlePageEvent(e: PageEvent) {
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.reloadReharvests();
  }


  reloadReharvests() {
    this.loading = true;
    this.pageIndex = 0;

    this.cdkApi.reharvests(this.pageIndex, this.pageSize, this.pid, this.filters).subscribe(resp => {
      this.dataSource = resp['response']['docs'];
      //console.log(this.dataSource);
      this.length = resp['response']['numFound'];
      this.loading = false;

    });
  }

  isReharvestFromCore(reharvest: Reharvest) {
    return reharvest.name?.startsWith("Delete");
  }

  clientLink(uuid: string) {
    return this.appSettings.userClientBaseUrl + "/uuid/" + uuid;
  }


  deleteRow(element: any) {
    const data: SimpleDialogData = {
      title: this.ui.getTranslation('modal.onRemoveCDKReharvest.title'),
      message: this.ui.getTranslation('modal.onRemoveCDKReharvest.message'),
      btn1: {
        label: this.ui.getTranslation('button.yes'),
        value: 'yes',
        color: 'warn'
      },
      btn2: {
        label: this.ui.getTranslation('button.no'),
        value: 'no',
        color: 'default'
      }
    };
    const dialogRef = this.dialog.open(SimpleDialogComponent, {
      data: data,
      width: '600px',
      panelClass: 'app-simple-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {

        this.cdkApi.deleteReharvest(element.id).subscribe(result => {
          this.reloadReharvests();
        });

      }
    });
  }

  openScheduledReHarvestSpecificPidsDialog() {
    const dialogRef = this.dialog.open(ScheduleReHarvestSpecificPidsDialogComponent, {
      width: '1400px',
      panelClass: 'app-schedule-re-harvest-specific-pids-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar('snackbar.error.scheduleCDKHarvest')
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else {
        this.ui.showInfoSnackBar('snackbar.success.scheduleCDKHarvest');
      }
      this.cdkApi.reharvests(this.pageIndex, this.pageSize,this.pid, this.filters).subscribe(resp => {
        this.dataSource = resp;
        this.reloadReharvests();
      });
    })
  }

  approveState(reharvest: any) {
    this.cdkApi.changeReharvestState(reharvest.id, 'open').subscribe(x => {

      //this.cdkApi.reharvests(this.pageIndex, this.pageSize, this.pid, this.filters).subscribe(resp => {

      this.cdkApi.reharvests(this.pageIndex, this.pageSize, this.pid, this.filters).subscribe(resp => {
        this.dataSource = resp['response']['docs'];
        this.length = resp['response']['numFound'];
        this.loading = false;

      });
    });
  }

  closedState(reharvest: any) {
    this.cdkApi.changeReharvestState(reharvest.id, 'cancelled').subscribe(x => {
      this.cdkApi.reharvests(this.pageIndex, this.pageSize, this.pid, this.filters).subscribe(resp => {
        this.dataSource = resp['response']['docs'];
        //console.log(this.dataSource);
        this.length = resp['response']['numFound'];
        this.loading = false;
      });
    });
  }

  onStateClick(state:string) {
    let filter = `state:${state}`;
    if (this.filters.indexOf(filter) < 0) {
      this.filters.push(`state:${state}`);
    } else {
      this.filters =  this.filters.filter(f => f !== filter);
    }
    this.reloadReharvests();
  }

  onTypeClick(type:string) {
    let filter = `type:${type}`;
    if (this.filters.indexOf(filter) < 0) {
      this.filters.push(`type:${type}`);
    } else {
      this.filters =  this.filters.filter(f => f !== filter);
    }
    this.reloadReharvests();
  }

  onFilterRemoveClick(filter:string) {
    this.filters =  this.filters.filter(f => f !== filter);
    this.reloadReharvests();    
  }

  onIdentKeyUp(target: any) {
    this.subject.next(target.value);
  }
  
  onPidClick(pid: string) {
    this.subject.next(pid);
  }

  onDeletePidClick() {
    this.pid = null; 
    this.reloadReharvests();
  }
    
  copyTextToClipboard(val: string) {
    this.clipboard.copy(val);
    this.ui.showInfoSnackBar('snackbar.success.copyToClipboard');
  }
    
}
