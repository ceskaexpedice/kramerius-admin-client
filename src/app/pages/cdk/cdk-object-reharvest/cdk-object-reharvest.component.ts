import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from 'ngx-flexible-layout';
import { ScheduleReHarvestSpecificPidsDialogComponent } from 'src/app/dialogs/schedule-re-harvest-specific-pids-dialog/schedule-re-harvest-specific-pids-dialog.component';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { Reharvest } from 'src/app/models/cdk.library.model';
import { AppSettings } from 'src/app/services/app-settings';
import { CdkApiService } from 'src/app/services/cdk-api.service';
import { UIService } from 'src/app/services/ui.service';


/**
 * Reharvests component, displaying and manage reharvets 
 */
@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FlexLayoutModule, MatChipsModule, MatFormFieldModule, MatFormFieldModule, MatInputModule,
    MatIconModule, MatTooltipModule, MatTableModule, MatButtonModule, MatCardModule, MatPaginatorModule, MatProgressBarModule
  ],
  selector: 'app-cdk-object-reharvest',
  templateUrl: './cdk-object-reharvest.component.html',
  styleUrls: ['./cdk-object-reharvest.component.scss']
})
export class CdkObjectReharvestComponent implements OnInit {

  /** Table columns */
  displayedColumns: string[] = [
    'date', 'pid', 'code', 'type', 'state', 'pod', 'description', 'approve', 'cancel', 'delete'
  ];
  /** Datasource for table */
  dataSource: Reharvest[];

  /** Paging properties */
  length = 50;
  pageSize = 5;
  pageIndex = 0;
  pageSizeOptions = [5, 100, 200];

  /** loading flag */
  loading = false;

  constructor(
    private dialog: MatDialog,
    private ui: UIService,
    private cdkApi: CdkApiService,
    private appSettings: AppSettings
  ) { }

  ngOnInit(): void {
    this.reloadReharvests();
  }



  handlePageEvent(e: PageEvent) {
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.reloadReharvests();
  }


  reloadReharvests() {
    this.loading = true;
    this.cdkApi.reharvests(this.pageIndex, this.pageSize).subscribe(resp => {
      this.dataSource = resp['response']['docs'];
      this.length = resp['response']['numFound'];
      this.loading = false;

      this.dataSource.sort((a, b) => b.getDateTime().getTime() - a.getDateTime().getTime());
    });
  }

  isReharvestFromCore(reharvest: Reharvest) {
    return reharvest.name?.startsWith("Delete");
  }

  clientLink(uuid: string) {
    return this.appSettings.userClientBaseUrl + "/uuid/" + uuid;
  }


  deleteRow(element: any) {
    const data: SimpleDialogData = {
      title: this.ui.getTranslation('modal.onRemoveCDKReharvest.title'),
      message: this.ui.getTranslation('modal.onRemoveCDKReharvest.message'),
      btn1: {
        label: this.ui.getTranslation('button.yes'),
        value: 'yes',
        color: 'warn'
      },
      btn2: {
        label: this.ui.getTranslation('button.no'),
        value: 'no',
        color: 'default'
      }
    };
    const dialogRef = this.dialog.open(SimpleDialogComponent, {
      data: data,
      width: '600px',
      panelClass: 'app-simple-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {

        this.cdkApi.deleteReharvest(element.id).subscribe(result => {
          this.reloadReharvests();
        });

      }
    });
  }

  openScheduledReHarvestSpecificPidsDialog() {
    const dialogRef = this.dialog.open(ScheduleReHarvestSpecificPidsDialogComponent, {
      width: '1400px',
      panelClass: 'app-schedule-re-harvest-specific-pids-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar('snackbar.error.scheduleCDKHarvest')
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else {
        this.ui.showInfoSnackBar('snackbar.success.scheduleCDKHarvest');
      }
      this.cdkApi.reharvests(this.pageSize, this.pageIndex).subscribe(resp => {
        this.dataSource = resp;
        this.dataSource.sort((a, b) => b.getDateTime().getTime() - a.getDateTime().getTime());
      });

    })

  }

  approveState(reharvest: any) {
    this.cdkApi.changeReharvestState(reharvest.id, 'open').subscribe(x => {
      this.cdkApi.reharvests(this.pageSize, this.pageIndex).subscribe(resp => {
        this.dataSource = resp;
        this.dataSource.sort((a, b) => b.getDateTime().getTime() - a.getDateTime().getTime());
      });
    });
  }

  closedState(reharvest: any) {
    this.cdkApi.changeReharvestState(reharvest.id, 'cancelled').subscribe(x => {
      this.cdkApi.reharvests(this.pageIndex, this.pageSize).subscribe(resp => {
        this.dataSource = resp;
        this.dataSource.sort((a, b) => b.getDateTime().getTime() - a.getDateTime().getTime());
      });
    });
  }


}
