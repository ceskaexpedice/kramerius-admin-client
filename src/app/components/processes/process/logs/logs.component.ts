import { Component, OnInit, Input } from '@angular/core';
import { Process } from 'src/app/models/process.model';
import { ApiService } from 'src/app/services/api.service';
import { PageEvent } from '@angular/material';

@Component({
  selector: 'app-process-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit {

  @Input()
  process: Process;

  // Paginator
  resultCount = 0;
  pageIndex = 0;
  pageSize = 8192; 
  //pageSize = 4096; 
  //pageSize = 2048; 

  //TODO: tohle by se melo incializovat po prvni nacteni dat a dale nemenit, protoze sice bude log soubor rust, ale velikost stranky nechceme menit uzivateli pod rukama

  lines: string[];


  constructor(private api: ApiService) { }

  ngOnInit() {
    this.reload();
  }


  reload() {
    //testovani s netrivialnim ERR logem
    //id: 125831
    //uuid: d974fc87-d3d5-4c13-a596-0356c2c3a8dd
    
    //total: 14867 B
    // const offset = 0;
    // const limit = 4096;
    const offset = this.pageIndex * this.pageSize;
    const limit = this.pageSize;
    this.api.getProcessLogsOut(this.process.uuid, offset, limit).subscribe(result => {
      this.resultCount = result['total_size'];
      this.lines = result['lines'];
      //this.lines = result['test'];
      console.log(result);
      //console.log(this.lines);
    });
  }


  onPageChanged(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.reload();
  }


}
