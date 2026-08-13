import { Component, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { KappItem, KappSync } from 'src/app/models/kapp.model';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { AppSettings } from 'src/app/services/app-settings';
import { UIService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-schedule-sync-with-kap',
  imports: [
    CommonModule, TranslateModule, FormsModule, MatDialogModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatTableModule,
    MatProgressBarModule, MatTooltipModule, MatPaginatorModule
  ],
  templateUrl: './schedule-sync-with-kap.component.html',
  styleUrl: './schedule-sync-with-kap.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class ScheduleSyncWithKapComponent implements OnInit {
  coreInfo:any;

  columnsToDisplay = ['pid', 'model', 'date_issued_year', 'title', 'sync_actions', 'process_id'];

  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];

  expandedElement: KappItem | null;

  dataSource: KappItem[] = [];

  length = 50;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25];
  info:any;
  lasttimestamp:any;
  kramInstance:string;
  kappInstance:string;

  constructor(
    public appSettings: AppSettings,
    private api: AdminApiService,
    private ui: UIService
  ) { }

  ngOnInit(): void {
    this.reloadData();
  }

  handlePageEvent(e: PageEvent) {
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.reloadData();
  }

  applyChanges() {
    //let actions:string[] = ['add_dnnto','add_dnntt','remove_dnnto','remove_dnntt','change_dnntt_dnnto','change_dnnto_dnntt' ];
    this.api.getKappSyncBatches().subscribe((response:any)=> {

      this.ui.showInfoSnackBar('snackbar.success.scheduleSdnntSyncProcess');
      /*
      data.forEach(oneBatch=> {
        console.log("Schedule "+oneBatch);
        this.api.scheduleProcess(
          oneBatch
        ).subscribe(response => {
          console.log(response);
          this.ui.showInfoSnackBar('snackbar.success.action_'+action);
        }, error => {
          this.ui.showInfoSnackBar('snackbar.fail.action_'+action);
        });
      });*/

    }, error => {
      this.ui.showInfoSnackBar('snackbar.error.scheduleSdnntSyncProcess');
    });
  }

  reloadData() {
    this.kramInstance = this.uuidBaseUrl(this.appSettings.userClientBaseUrl || this.appSettings.coreBaseUrl + '/..');

    this.api.getKappSyncInfo().subscribe((data:any)=> {
      this.info = data;
      this.kappInstance = this.kappBaseUrl(this.info.endpoint);

      this.appSettings.getCoreInfo().subscribe(response => {
        this.coreInfo = response;

        if (!this.appSettings.userClientBaseUrl && this.coreInfo?.instance?.client) {
          this.kramInstance = this.uuidBaseUrl(this.coreInfo.instance.client);
        }
      });
    });

    this.api.getKappSyncTimestamp().subscribe((data:any)=> {
      this.lasttimestamp = data['fetched'] || 'none';
    });

    this.api.getKappSyncData(this.pageSize, this.pageIndex).subscribe((data:KappSync) =>  {
      this.length = data.numberOfRec;
      this.dataSource = data.docs;
    },  (error:HttpErrorResponse) => {
      console.log('error ' + error);
    });
  }

  private uuidBaseUrl(baseUrl:string): string {
    return baseUrl.replace(/\/$/, '') + '/uuid/';
  }

  private kappBaseUrl(endpoint:string): string {
    if (!endpoint) {
      return '';
    }

    const suffix = '/rest/v1/changes';
    const suffixIndex = endpoint.indexOf(suffix);
    if (suffixIndex > -1) {
      return endpoint.substring(0, suffixIndex);
    }

    return endpoint.replace(/\/$/, '');
  }

  kappItemUrl(element:KappItem): string {
    const query = element.id || element.title;
    if (!this.kappInstance || !query) {
      return '';
    }

    return `${this.kappInstance}/titles?q=${encodeURIComponent(query)}`;
  }

  shortenProcessId(processId:string): string {
    if (!processId) {
      return '';
    }

    return processId.length > 3 ? `${processId.substring(0, 3)}...` : processId;
  }

  getChildren(id:string) {
    this.api.getKappSyncDataGranularity(id).subscribe((data:KappItem[]) =>  {
      this.dataSource.forEach((itm:KappItem) => {
        if (itm.id === id) {
          itm.children = data;
        }
      });
    },  (error:HttpErrorResponse) => {
      console.log('error ' + error);
    });
  }
}
