import { Component, OnInit, Input } from '@angular/core';
import { Process } from 'src/app/models/process.model';
import { PageEvent } from '@angular/material/paginator';
import { AdminApiService } from 'src/app/services/admin-api.service';

@Component({
  selector: 'app-process-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit {

  @Input()
  process: Process;

  @Input()
  logType: string;


  // Paginator
  resultCount = 0;
  pageIndex = 0;
  pageSize = 8192;
  //pageSize = 4096; 
  //pageSize = 2048; 
  //TODO: tohle by se melo incializovat po prvni nacteni dat a dale nemenit, protoze sice bude log soubor rust, ale velikost stranky nechceme menit uzivateli pod rukama

  lines: string[];

  constructor(private adminApi: AdminApiService) { }

  ngOnInit() {
    this.reload();
  }

  reload() {
    const offset = this.pageIndex * this.pageSize;
    const limit = this.pageSize;
    this.adminApi.getProcessLogs(this.process.uuid, this.logType, offset, limit).subscribe(result => {
      this.resultCount = result['total_size'];
      this.lines = result['lines'];
    });
  }

  onPageChanged(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.reload();
  }


}
