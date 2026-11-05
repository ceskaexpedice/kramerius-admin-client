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

interface LogSegment {
  text: string;
  href?: string;
}

@Component({
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
  renderedLines: LogSegment[][] = [];

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
      this.renderedLines = (this.lines || []).map(line => this.parseLine(line));
    });
  }

  private parseLine(line: string): LogSegment[] {
    const segments: LogSegment[] = [];
    const linkPattern = /<a\s+href=(['"])(.*?)\1[^>]*>(.*?)<\/a>/gi;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = linkPattern.exec(line)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ text: line.slice(lastIndex, match.index) });
      }

      const href = this.allowedReharvestLink(match[2]);
      const label = match[3].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      if (href) {
        segments.push({ text: label, href });
      } else {
        segments.push({ text: match[0] });
      }
      lastIndex = linkPattern.lastIndex;
    }

    if (lastIndex < line.length) {
      segments.push({ text: line.slice(lastIndex) });
    }
    return segments.length ? segments : [{ text: line }];
  }

  private allowedReharvestLink(rawHref: string): string | null {
    const href = rawHref.replace(/&amp;/g, '&');
    try {
      const url = new URL(href, 'http://local.invalid');
      const dialog = url.searchParams.get('dialog');
      if (url.origin !== 'http://local.invalid' || url.pathname !== '/cdk/object-reharvest' ||
          !['introspection', 'reharvest'].includes(dialog || '') ||
          (!url.searchParams.has('pid') && !url.searchParams.has('pids'))) {
        return null;
      }
      return `${url.pathname}${url.search}`;
    } catch {
      return null;
    }
  }

  onPageChanged(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.reload();
  }


}
