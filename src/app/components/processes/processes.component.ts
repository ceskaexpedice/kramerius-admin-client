import { Component, OnInit } from '@angular/core';
import { ProcessService } from '../../services/process.service'
import { Filters } from './filters';
import { PageEvent } from '@angular/material';


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
  filters: Filters = {
    owner: '',
    state: ''
  };

  states = [
    'RUNNING',
    'FINISHED',
    'FAILED',
    'KILLED',
    'PLANNED',
  ];

  owners = [
    'rehan',
    'editor',
    'hanis',
    'krameriusAdmin'
  ];

  batches: any[];

  constructor(private service: ProcessService) { }

  ngOnInit() {
    this.reload();
  }

  reload() {
    const limit = this.pageSize;
    const offset = this.pageIndex * this.pageSize;
    this.service.getProcesses(offset, limit, this.filters).subscribe(response => {
      this.batches = response['batches'];
      this.resultCount = response['total_size'];
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

  onDateFromChanged() {
    this.filters.from = new Date(String(this.dateFrom));
  }

  onDateToChanged() {
    this.filters.until = new Date(String(this.dateTo));
  }

  clearDateFrom() {
    this.dateFrom = null;
    this.filters.from = null;
  }

  clearDateTo() {
    this.dateTo = null;
    this.filters.until = null;
  }



  onSelectedOwnerChanged(event) {
    this.reload();
  }

  toDurationInMs(start, end) {
    if (start === null || end === null) {
      return null;
    }
    const result = Date.parse(end) - Date.parse(start);
    return result;
  }

}
