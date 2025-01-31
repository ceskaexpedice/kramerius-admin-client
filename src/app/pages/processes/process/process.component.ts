import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Process } from 'src/app/models/process.model';
import { Batch } from 'src/app/models/batch.model';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { MatDialog } from '@angular/material/dialog';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { UIService } from 'src/app/services/ui.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { DurationPipe } from 'src/app/pipes/duration.pipe';
import { DatetimePipe } from 'src/app/pipes/datetime.pipe';
import { LogsComponent } from './logs/logs.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, 
    MatTooltipModule, MatTabsModule, 
    DurationPipe, DatetimePipe, LogsComponent
  ],
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.scss']
})
export class ProcessComponent implements OnInit {

  processId: number;

  batch: Batch;
  process: Process;
  log = 'out';

  view: string;

  // when current data was loaded
  loadedTimestamp: Date;

  constructor(
    private route: ActivatedRoute,
    private adminApi: AdminApiService, 
    private dialog: MatDialog, 
    private router: Router,  
    private local: LocalStorageService,
    private ui: UIService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.processId = params['id'];
      this.reloadProcess();
    })

    //this.view = this.local.getStringProperty('processes.view');
    this.view = this.router.url.replace('/processes/', '').replace('/' + this.processId, '');
  }

  reloadProcess() {
    // fetch process detail
    this.adminApi.getProcess(this.processId)
      .subscribe(
        ([batch, process]: [Batch, Process]) => {
          this.batch = batch;
          this.process = process;
          this.loadedTimestamp = new Date();
        }
      );
  }

  onKillProcess(batch: Batch) {
    const data: SimpleDialogData = {
      title: this.ui.getTranslation('modal.onKillProcess.title'),
      message: this.ui.getTranslation('modal.onKillProcess.message'),
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
        this.adminApi.killBatch(batch.id).subscribe((result) => {
          this.reloadProcess();
          this.ui.showInfoSnackBar('snackbar.success.onKillProcess');
        }, error => {
          this.ui.showErrorSnackBar('snackbar.error.onKillProcess');
       });
      }
    });
  }

  onRemoveProcess(batch: Batch) {
    const data: SimpleDialogData = {
      title: this.ui.getTranslation('modal.onRemoveProcess.title'),
      message: this.ui.getTranslation('modal.onRemoveProcess.message'),
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
        this.adminApi.deleteProcessBatch(batch.id).subscribe(result => {
          //console.log(result)
          this.router.navigate(['..'], { relativeTo: this.route });
          this.ui.showInfoSnackBar('snackbar.success.onRemoveProcess');
        }, error => {
          this.ui.showErrorSnackBar('snackbar.error.onRemoveProcess');
        });
      }
    });
  }

  canDownloadLog() {
    switch (this.batch.state) {
      case Process.FINISHED:
      case Process.FAILED:
      case Process.KILLED:
        return true;
      default:
        return false;
    }
  }

  logOutUrl() {
    return this.adminApi.getProcessLogsUrl(this.process.uuid, "out", this.logOutFilename());
  }

  logOutFilename() {
    return `process_${String(this.process.id)}_out.txt`;
  }

  logErrUrl() {
    return this.adminApi.getProcessLogsUrl(this.process.uuid, "err", this.logErrFilename());
  }

  logErrFilename() {
    return `process_${String(this.process.id)}_err.txt`;
  }

  changeView(view: string) {
    this.view = view;
    this.local.setStringProperty('processes.view', view);
    this.router.navigate(['/processes/' + view + '/', this.processId]);
  }

  getCurrentRoute(type: string) {
    if (type === 'string') {
      return this.router.url.replace('/processes/', '');
    } else {
      return this.router.url;
    }
  } 


}
