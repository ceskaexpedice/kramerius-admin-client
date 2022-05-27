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


@Component({
  selector: 'app-processes',
  templateUrl: './processes.component.html',
  styleUrls: ['./processes.component.scss']
})
export class ProcessesComponent implements OnInit {

  //TODO: should be in it's own component
  //Test process
  testProcessFinalStates = ['FINISHED', 'FAILED', 'WARNING', 'RANDOM'];
  selectedtestProcessFinalState = this.testProcessFinalStates[0];
  testProcessProcessesInBatch = [1, 2, 3, 4, 5]
  selectedTestProcessProcessesInBatch = this.testProcessProcessesInBatch[0];
  testProcessDuration = [1, 5, 10, 30, 60, 120]
  selectedTestProcessDuration = this.testProcessDuration[0];

  displayedColumns = ['expand', 'id', 'name', 'state', 'planned', 'started', 'finished', 'duration', 'owner', 'action'];

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
  batches: Batch[];

  fetchingProcesses = false;
  fetchingOwners = false;
  schedulingProcesses = false;
  deletingProcesses = false;
  cancelingProcesses = false;

  // when current data was loaded
  loadedTimestamp: Date;

  constructor(
    private adminApi: AdminApiService,
    private dialog: MatDialog,
    public appSettings: AppSettings,
    private ui: UIService
  ) {
    for (const state of Process.BATCH_STATES) {
      this.batch_states.push({ key: state, label: Process.stateLabel(state) })
    }
  }

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.fetchingProcesses = true;
    this.batches = [];
    this.adminApi.getProcesses(this.buildProcessesParams()).subscribe(([batches, total]: [Batch[], number]) => {
      this.batches = batches;
      this.resultCount = total;
      this.fetchingProcesses = false;
      this.loadedTimestamp = new Date();
    }, error => {
      this.ui.showErrorSnackBar("Nepodařilo se načíst procesy")
      this.fetchingProcesses = false;
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
      this.reload();
    }, error => {
      this.ui.showErrorSnackBar("Nepodařilo se naplánovat proces")
      this.schedulingProcesses = false;
    });
  }

  onPageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.reload();
  }

  onFiltersChanged() {
    this.pageIndex = 0;
    this.reload();
  }

  onRemove(batch: Batch) {
    const data: SimpleDialogData = {
      title: "Smazání procesu/dávky",
      message: "Určitě chcete proces/dávku trvale smazat?",
      btn1: {
        label: 'Ano',
        value: 'yes',
        color: 'warn'
      },
      btn2: {
        label: 'Ne',
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
          this.reload();
        }, error => {
          this.ui.showErrorSnackBar("Nepodařilo se smazat proces/dávku")
          this.deletingProcesses = false;
        });
      }
    });
  }

  onKill(batch: Batch) {
    const data: SimpleDialogData = {
      title: "Zrušení procesu/dávky",
      message: "Určitě chcete zrušit proces/dávku?",
      btn1: {
        label: 'Ano',
        value: 'yes',
        color: 'warn'
      },
      btn2: {
        label: 'Ne',
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
          this.reload();
        }, error => {
          this.ui.showErrorSnackBar("Nepodařilo se zrušit proces/dávku")
          this.cancelingProcesses = false;
        });
      }
    });
  }

  onSelectedOwnerChanged(event) {
    this.reload();
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

  convertDate(date) { //01/02/2021 -> 2021-02-01
    const year = date.slice(6, 10);
    const month = date.slice(3, 5);
    const day = date.slice(0, 2);
    return `${year}-${month}-${day}`;
  }

  onKillAllScheduled() {
    let requests = [];
    this.batches.forEach(batch => {
      if (batch.state == Process.PLANNED) {
        requests.push(this.adminApi.killBatch(batch.id));
      }
    });

    const data: SimpleDialogData = {
      title: "Zrušení naplánovaných procesů",
      message: `Určitě chcete zrušit ${requests.length} naplánovaných procesů?`,
      btn1: {
        label: 'Ano',
        value: 'yes',
        color: 'warn'
      },
      btn2: {
        label: 'Ne',
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
        console.log("killing " + requests.length + " scheduled processes")
        forkJoin(requests).subscribe(result => {
          console.log("killed " + result.length)
          if (result.length == requests.length) {//after last one
            this.cancelingProcesses = false;
            this.reload();
          }
        });
      }
    });
  }

  isLoading() {
    return this.fetchingOwners || this.fetchingProcesses || this.schedulingProcesses || this.deletingProcesses || this.cancelingProcesses;
  }

}
