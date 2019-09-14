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
  
  //process data
  processTotalCount= 0; //number of all processes with filteres applied
  processes: Object[] = []; //processes of current page
  
  //pagionation
  pageSizeOptions: number[] = [10, 25, 50, 100];
  pageSize = this.pageSizeOptions[0];

  //query data
  filters = null;
  offset = 0;
  limit = this.pageSize;
  
  //table
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  tableDisplayedColumns: string[] = ['id', 'name', 'state', 'planned', 'started', 'finished', 'duration', 'owner'];
  tableDataSource = new MatTableDataSource(this.processes);

  //TODO: subprocesses
  batchesOpen = new Set();
  selectedProcess;


  constructor(private service: ProcessService) { }

  ngOnInit() {
    this.fetchProcesses();
  }

  onPageEvent(pageEvent: PageEvent){
    this.limit = pageEvent.pageSize;
    this.offset = pageEvent.pageIndex * pageEvent.pageSize;
    this.fetchProcesses();
  }

  test() {
    // this.processes.push({
    //   bash_id: 123,
    //   name: 'blabla'
    // })
    // this.table.renderRows();
    // console.log(this.processes);
  }

  fetchProcesses() {
    this.service.getProcesses(this.offset, this.limit, this.filters).subscribe(response => {
      this.processTotalCount = response['total_size'];
      //console.log(response);
      //this.processes = response['items'];
      //because table is referencing this array
      this.processes.length = 0;
      response['items'].forEach(element => {
        this.processes.push(element);
      });
      this.table.renderRows();
    });
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
    console.log('onFilterUpdated');
    console.log(filters);
    //console.log(JSON.stringify(filters));
    this.filters = filters;
    this.fetchProcesses();
  }

  onProcessSelected(process) {
    console.log(process);
    this.selectedProcess = process;
  }

  toggleBatchOpen(process) {
    console.log(process);
    const processId = process.batch_id;
    if (this.batchesOpen.has(processId)) {
      this.batchesOpen.delete(processId);
    } else {
      this.batchesOpen.add(processId);
    }
  }

  isBatchOpen(batchId) {
    return this.batchesOpen.has(batchId);
  }


}
