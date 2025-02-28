import { Component, OnInit, Input } from '@angular/core';
import { Process } from 'src/app/models/process.model';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule,
    MatButtonModule, MatIconModule, MatPaginatorModule,
    MatTooltipModule
  ],
  selector: 'app-process-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit {

  @Input()
  process: Process;

  @Input()
  logType: string;

  @Input()
  urlOutUrl: string;


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

  // isSevereOrWarning(line) {
  //   return line.indexOf('WARNING') || line.indexOf('SEVERE')
  // }

  // isInfoLine(line) {
  //   return line.indexOf('INFO')
  // }

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
