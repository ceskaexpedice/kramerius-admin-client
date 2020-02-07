import { Component, OnInit, ViewChild } from '@angular/core';
import { ProcessService } from '../../services/process.service'
import { Filters } from './filters';
import { MatSort, MatTable, MatTableDataSource, PageEvent } from '@angular/material';


@Component({
  selector: 'app-processes',
  templateUrl: './processes.component.html',
  styleUrls: ['./processes.component.scss']
})
export class ProcessesComponent implements OnInit {

  //batch (and process) data
  batchTotalCount = 0;
  batches: Object[] = []; //batches of current page

  //pagination
  pageSizeOptions: number[] = [10, 25, 50, 100];
  pageSize = this.pageSizeOptions[0];

  //query data
  filters = null;
  offset = 0;
  limit = this.pageSize;

  //table
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  tableDisplayedColumns: string[] = ['btn', 'id', 'name', 'state', 'planned', 'started', 'finished', 'duration', 'owner'];
  tableItems: Object[] = []; //items in table (batch + processes in batch if batch is open)
  tableDataSource = new MatTableDataSource(this.tableItems);
  batchesOpen = new Set();
  selectedProcess;


  constructor(private service: ProcessService) { }

  ngOnInit() {
    this.fetchProcesses();
  }

  onPageEvent(pageEvent: PageEvent) {
    this.limit = pageEvent.pageSize;
    this.offset = pageEvent.pageIndex * pageEvent.pageSize;
    this.fetchProcesses();
  }

  fetchProcesses() {
    this.service.getProcesses(this.offset, this.limit, this.filters).subscribe(response => {
      this.batchTotalCount = response['total_size'];
      //console.log(response);
      this.batchesOpen.clear();
      //console.log('response')
      //console.log(response);
      this.batches = response['batches'];
      this.resetTableItems();
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
    this.service.scheduleProcess(params).subscribe(response => {
      console.log(response);
      this.fetchProcesses();
    });
  }

  resetTableItems() {
    //console.log('resetTableItems')
    this.tableItems.length = 0;
    this.batches.forEach(batch => {
      const batchItem = {};
      batchItem['type'] = 'batch'
      batchItem['batch'] = batch['batch']
      batchItem['processes'] = batch['processes']
      //console.log(batchItem);
      this.tableItems.push(batchItem);
      if (this.isBatchOpen(batch['batch']['id'])) {
        batchItem['processes'].forEach(process => {
          const processItem = {};
          processItem['type'] = 'process';
          processItem['process'] = process;
          processItem['batch'] = batch['batch'];
          //console.log(processItem);
          this.tableItems.push(processItem);
        });
      }
    });
    this.table.renderRows();
  }

  processCanBeDeleted(processState: string) {
    return this.service.processCanBeDeleted(processState);
  }

  processCanBeCanceled(processState: string) {
    return this.service.processCanBeCanceled(processState);
  }

  processLogsAvailable(processState: string) {
    return this.service.processLogsAvailable(processState);
  }

  isSuccess(processState: string) {
    return this.service.isSuccess(processState);
  }

  isWarning(processState: string) {
    return this.service.isWarning(processState);
  }

  isDanger(processState: string) {
    return this.service.isDanger(processState);
  }

  toDurationInMs(start, end) {
    if (start === null || end === null) {
      return null;
    }
    const result = Date.parse(end) - Date.parse(start);
    return result;
  }

  onFilterUpdated(filters: Filters) {
    //console.log('onFilterUpdated');
    //console.log(filters);
    //console.log(JSON.stringify(filters));
    this.filters = filters;
    this.fetchProcesses();
  }

  onProcessSelected(process) {
    //console.log(process);
    this.selectedProcess = process;
  }

  toggleBatchOpen(batchId) {
    //console.log("toggleBatchOpen: " + batchId);
    var nowClosed = !this.batchesOpen.has(batchId);
    if (nowClosed) {
      this.batchesOpen.add(batchId);
    } else {
      this.batchesOpen.delete(batchId);
    }
    this.resetTableItems();
  }

  isBatchOpen(batchId) {
    return this.batchesOpen.has(batchId);
  }


}
