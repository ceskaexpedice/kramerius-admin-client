import { Component, OnInit } from '@angular/core';
import { PageEvent, MatDialog } from '@angular/material';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { ApiService, ProcessesParams } from 'src/app/services/api.service';
import { Batch } from 'src/app/models/batch.model';
import { Process } from 'src/app/models/process.model';


@Component({
  selector: 'app-processes',
  templateUrl: './processes.component.html',
  styleUrls: ['./processes.component.scss']
})
export class ProcessesComponent implements OnInit {

  // Paginator
  resultCount = 0;
  pageIndex = 0;
  pageSize = 50;

  // Filters
  dateFrom;
  dateTo;
  selectedOwner = '';
  selectedState = '';

  states = [];

  owners = [
    'rehan',
    'editor',
    'hanis',
    'krameriusAdmin'
  ];

  batches: Batch[];

  constructor(private api: ApiService, private dialog: MatDialog) {
    for (const state of Process.STATES) {
      this.states.push( { key: state, label: Process.stateLabel(state) })
    }
  }

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.api.getProcesses(this.buildProcessesParams()).subscribe(([batches, total]: [Batch[], number]) => {
      this.batches = batches;
      this.resultCount = total
    });
  }

  scheduleProcess() {
    const params = {
      type: 'test',
      params: {
        duration: '5',
        processesInBatch: '3',
        fail: false,
      }
    }
    this.api.scheduleProcess(params).subscribe(response => {
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
      title: "Smazání procesu",
      message: "Určitě chcete proces trvale smazat?",
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
        // TODO: Delete process and reload data
      }
    });
  }

  onKill(batch: Batch) {
    const data: SimpleDialogData = {
      title: "Zrušení procesu",
      message: "Určitě chcete zrušit celý proces?",
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
        // TODO: kill process and reload data
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
