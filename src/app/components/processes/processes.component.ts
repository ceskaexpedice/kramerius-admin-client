import { Component, OnInit } from '@angular/core';
import {ProcessService} from '../../services/process.service'
import { Filters } from './filters';

@Component({
  selector: 'app-processes',
  templateUrl: './processes.component.html',
  styleUrls: ['./processes.component.scss']
})
export class ProcessesComponent implements OnInit {

  processCount: number; //number of all processes with filteres applied
  processes: Object[]; //processes of current page
  page = 1;
  pageSize = 100;
  filters = null;
  batchesOpen = new Set();
  selectedProcess;

  constructor(private service: ProcessService) { }

  ngOnInit() {
    this.fetchProcesses();
  }

  fetchProcesses() {
    const offset = this.pageSize * (this.page - 1);
    const limit = this.pageSize;
    console.log('offset: ' + offset);
    console.log('limit: ' + limit);
    this.service.getProcesses(offset, limit, this.filters).subscribe(response => {
      this.processCount = response['total_size'];
      console.log(response);
      this.processes = response['items'];
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
    //this.filters = filters;
    //this.fetchProcesses();
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
