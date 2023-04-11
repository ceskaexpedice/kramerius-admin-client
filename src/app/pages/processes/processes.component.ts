import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { Batch } from 'src/app/models/batch.model';
import { Process } from 'src/app/models/process.model';
import { ProcessOwner } from 'src/app/models/process-owner.model';
import { AdminApiService, ProcessesParams } from 'src/app/services/admin-api.service';
import { AppSettings } from 'src/app/services/app-settings';
import { forkJoin, interval, Subscription } from 'rxjs';
import { UIService } from 'src/app/services/ui.service';
import { CancelScheduledProcessesDialogComponent } from 'src/app/dialogs/cancel-scheduled-processes-dialog/cancel-scheduled-processes-dialog.component';
import { AuthService } from 'src/app/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-processes',
  templateUrl: './processes.component.html',
  styleUrls: ['./processes.component.scss']
})
export class ProcessesComponent implements OnInit {

  //TODO: should be in it's own component
  //Test process

  static ONWER_ACTION:string = 'a_owner_process_edit';
  // cteni musi byt uz na strane backendu
  static READ_ACTION:string = 'a_process_read';
  static EDIT_ACTION:string = 'a_process_edit';


  testProcessFinalStates = ['FINISHED', 'FAILED', 'WARNING', 'RANDOM'];
  selectedtestProcessFinalState = this.testProcessFinalStates[0];
  testProcessProcessesInBatch = [1, 2, 3, 4, 5]
  selectedTestProcessProcessesInBatch = this.testProcessProcessesInBatch[0];
  testProcessDuration = [1, 5, 10, 30, 60, 120]
  selectedTestProcessDuration = this.testProcessDuration[0];

  displayedColumns = ['expand', 'id', 'name', 'state', 'planned', 'started', 'finished', 'duration', 'owner', 'action'];

  // to test accesibility
  //notAllowed: boolean = true;
  //batchId: string = '94';


  // Paginator
  resultCount = 0;
  pageIndex = 0;
  pageSize = 50;

  // Filters
  dateFrom;
  dateTo;
  selectedOwner;
  selectedState;

  batch_states = [];
  owners: ProcessOwner[] = []
  batches: Batch[] = []
  batches_planned: Batch[] = [];

  fetchingProcesses = false;
  fetchingOwners = false;
  schedulingProcesses = false;
  deletingProcesses = false;
  cancelingProcesses = false;

  // when current data was loaded
  loadedTimestamp: Date;

  errorMessage: string;
  errorState: boolean = false;

  constructor(
    private adminApi: AdminApiService,
    private auth: AuthService,
    private dialog: MatDialog,
    public appSettings: AppSettings,
    private ui: UIService,
    private router: Router, 
    private local: LocalStorageService
  ) {
    for (const state of Process.BATCH_STATES) {
      this.batch_states.push({ key: state, label: Process.stateLabel(state) })
    }
  }

  ngOnInit() {
    this.reloadProcesses();
  }

  reloadProcesses() {
    this.fetchingProcesses = true;
    this.batches = [];
    this.batches_planned = [];
    this.adminApi.getProcesses(this.buildProcessesParams()).subscribe(([batches, total]: [Batch[], number]) => {
      this.batches = batches;
      this.batches_planned = batches.filter(batch => batch.state == 'PLANNED');
      this.resultCount = total;
      this.fetchingProcesses = false;
      this.loadedTimestamp = new Date();
    }, (error: HttpErrorResponse) => {
      this.ui.showErrorSnackBar('snackbar.error.reloadProcesses');
      this.fetchingProcesses = false;
      this.errorState = true;
      this.errorMessage = error.error.message;
    });
    this.fetchingOwners = true;
    this.adminApi.getProcessOwners().subscribe((owners: ProcessOwner[]) => {
      this.owners = owners;
      this.fetchingOwners = false;
    }, error => this.fetchingOwners = false);
  }

  scheduleTestProcess() {
    this.schedulingProcesses = true;
    const params = {
      defid: 'new_process_api_test',
      params: {
        duration: this.selectedTestProcessDuration,
        processesInBatch: this.selectedTestProcessProcessesInBatch,
        finalState: this.selectedtestProcessFinalState,
      }
    }
    this.adminApi.scheduleProcess(params).subscribe(response => {
      this.schedulingProcesses = false;
      this.reloadProcesses();
    }, error => {
      this.ui.showErrorSnackBar('snackbar.error.scheduleTestProcess')
      this.schedulingProcesses = false;
    });
  }

  onPageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.reloadProcesses();
  }

  onFiltersChanged() {
    this.pageIndex = 0;
    this.reloadProcesses();
  }

  onRemoveProcess(batch: Batch) {
    const data: SimpleDialogData = {
      title: this.ui.getTranslation('modal.onRemoveProcess.title'),
      message: this.ui.getTranslation('modal.onRemoveProcess.message'),
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
        this.deletingProcesses = true;
        this.adminApi.deleteProcessBatch(batch.id).subscribe(result => {
          //console.log(result)
          this.deletingProcesses = false;
          this.reloadProcesses();
          this.ui.showInfoSnackBar('snackbar.success.onRemoveProcess');
        }, error => {
          this.ui.showErrorSnackBar('snackbar.error.onRemoveProcess');
          this.deletingProcesses = false;
        });
      }
    });
  }

  onKillProcess(batch: Batch) {
    const data: SimpleDialogData = {
      title: this.ui.getTranslation('modal.onKillProcess.title'),
      message: this.ui.getTranslation('modal.onKillProcess.message'),
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
        this.cancelingProcesses = true;
        this.adminApi.killBatch(batch.id).subscribe((result) => {
          this.cancelingProcesses = false;
          this.reloadProcesses();
          this.ui.showInfoSnackBar('snackbar.success.onKillProcess');
        }, error => {
          this.ui.showErrorSnackBar('snackbar.error.onKillProcess');
          this.cancelingProcesses = false;
        });
      }
    });
  }

  onSelectedOwnerChanged(event) {
    this.reloadProcesses();
  }

  private buildProcessesParams(): any {
    const params = {
      offset: this.pageIndex * this.pageSize,
      limit: this.pageSize
    } as ProcessesParams;
    if (this.selectedState) {
      params.state = this.selectedState;
    }
    if (this.selectedOwner) {
      params.owner = this.selectedOwner;
    }
    if (this.dateFrom) {
      //params.from = new Date(String(this.dateFrom)).toISOString().slice(0, 19);
      const from = this.convertDate(new Date(String(this.dateFrom)).toLocaleDateString('en-GB')) + "T00:00:00";
      //console.log(from);
      params.from = from;
    }
    if (this.dateTo) {
      //params.until = new Date(String(this.dateTo)).toISOString().slice(0, 19);
      const until = this.convertDate(new Date(String(this.dateTo)).toLocaleDateString('en-GB')) + "T23:59:59";
      //console.log(until);
      params.until = until;
    }
    return params;
  }

  convertDate(date) { // 01/02/2021 -> 2021-02-01
    const year = date.slice(6, 10);
    const month = date.slice(3, 5);
    const day = date.slice(0, 2);
    return `${year}-${month}-${day}`;
  }

  isLoading() {
    return this.fetchingOwners || this.fetchingProcesses || this.schedulingProcesses || this.deletingProcesses || this.cancelingProcesses;
  }

  onCancelScheduledProcesses() {
    const dialogRef = this.dialog.open(CancelScheduledProcessesDialogComponent, {
      data: this.buildProcessesParams(),
      width: '600px',
      panelClass: 'app-cancel-scheduled-processes-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state) {
        switch (result.state) {
          case 'closed': break;
          case 'killed':
            this.ui.showInfoSnackBar('snackbar.success.onKillAllScheduled', { value: result.kills });
        }
      }
      this.reloadProcesses();
    });
  }

  notAllowed(b:string) {
    if (this.auth.user) {
      if (this.auth.authorizedGlobalActions.indexOf(ProcessesComponent.EDIT_ACTION) >= 0) {
          return false;
      } else if (this.auth.authorizedGlobalActions.indexOf(ProcessesComponent.ONWER_ACTION) >= 0 && 
            this.auth.authorizedGlobalActions.indexOf(ProcessesComponent.READ_ACTION) >= 0) {
            let ub =  this.batches.filter(batch => batch.id == Number(b));
            if (ub.length > 0) {
              return ub[0].ownerId !== this.auth.user.uid;
            }
      } 
    } 
    return true;
  }

  setRouterLink(path: string = null, id: string,  viewProperty: string = null, viewValue: string = null) {
    this.router.navigate([path, id]);
    this.local.setStringProperty(viewProperty + '.view', viewValue);
  }

  getRouterLink(path: string = null, id: string,  viewProperty: string = null, viewValue: string = null) {
    this.local.setStringProperty(viewProperty + '.view', viewValue);
    return path + id;
  }
}
