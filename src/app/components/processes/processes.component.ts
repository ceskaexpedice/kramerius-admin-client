import { Component, OnInit } from '@angular/core';
import { PageEvent, MatDialog } from '@angular/material';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { Batch } from 'src/app/models/batch.model';
import { Process } from 'src/app/models/process.model';
import { ProcessOwner } from 'src/app/models/process-owner.model';
import { AdminApiService, ProcessesParams } from 'src/app/services/admin-api.service';
import { AppSettings } from 'src/app/services/app-settings';


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

  // Paginator
  resultCount = 0;
  pageIndex = 0;
  pageSize = 50;

  // Filters
  dateFrom;
  dateTo;
  selectedOwner = '';
  selectedState = '';

  batch_states = [];
  owners: ProcessOwner[] = []
  batches: Batch[];

  constructor(private adminApi: AdminApiService, private dialog: MatDialog, public appSettings: AppSettings) {
    for (const state of Process.BATCH_STATES) {
      this.batch_states.push({ key: state, label: Process.stateLabel(state) })
    }
  }

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.adminApi.getProcesses(this.buildProcessesParams()).subscribe(([batches, total]: [Batch[], number]) => {
      this.batches = batches;
      this.resultCount = total
    });
    this.adminApi.getProcessOwners().subscribe((owners: ProcessOwner[]) => {
      this.owners = owners;
    });
  }

  scheduleTestProcess() {
    const params = {
      defid: 'new_process-api-test',
      params: {
        duration: this.selectedTestProcessDuration,
        processesInBatch: this.selectedTestProcessProcessesInBatch,
        finalState: this.selectedtestProcessFinalState,
      }
    }
    this.adminApi.scheduleProcess(params).subscribe(response => {
      this.reload();
    });
  }

  onPageChanged(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.reload();
  }

  onSelectedStateChanged(event) {
    this.reload();
  }

  clearDateFrom() {
    this.dateFrom = null;
  }

  clearDateTo() {
    this.dateTo = null;
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
    const dialogRef = this.dialog.open(SimpleDialogComponent, { data: data });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.adminApi.deleteProcessBatch(batch.id).subscribe(result => {
          //console.log(result)
          this.reload();
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
    const dialogRef = this.dialog.open(SimpleDialogComponent, { data: data });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.adminApi.killBatch(batch.id).subscribe((result) => {
          this.reload();
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
      params.from = new Date(String(this.dateFrom)).toISOString().slice(0, 19);
    }
    if (this.dateTo) {
      params.until = new Date(String(this.dateTo)).toISOString().slice(0, 19);
    }
    return params;
  }


}
