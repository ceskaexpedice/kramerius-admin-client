import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Process } from 'src/app/models/process.model';
import { Batch } from 'src/app/models/batch.model';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { MatDialog } from '@angular/material';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { AdminApiService } from 'src/app/services/admin-api.service';

@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.scss']
})
export class ProcessComponent implements OnInit {

  processId;

  batch: Batch;
  process: Process;
  log = 'out';

  constructor(private route: ActivatedRoute, private adminApi: AdminApiService, private dialog: MatDialog, private router: Router) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.processId = params['id'];
      this.reload();
    })
  }

  reload() {
    // fetch process detail
    this.adminApi.getProcess(this.processId)
      .subscribe(
        ([batch, process]: [Batch, Process]) => {
          this.batch = batch;
          this.process = process;
          console.log(this.batch);
          console.log(this.process);
        }
      );
  }

  onKill(batch: Batch) {
    const data: SimpleDialogData = {
      title: "Zrušení procesu/dávky",
      message: "Určitě chcete zrušit proces/dávku?",
      btn1: {
        label: 'Ano',
        value: 'yes',
        color: 'warn'
      },
      btn2: {
        label: 'Ne',
        value: 'no',
        color: 'default'
      }
    };
    const dialogRef = this.dialog.open(SimpleDialogComponent, { data: data });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.adminApi.killBatch(batch.id).subscribe((result) => {
          this.reload();
        });
      }
    });
  }

  onRemove(batch: Batch) {
    const data: SimpleDialogData = {
      title: "Smazání procesu/dávky",
      message: "Určitě chcete proces/dávku trvale smazat?",
      btn1: {
        label: 'Ano',
        value: 'yes',
        color: 'warn'
      },
      btn2: {
        label: 'Ne',
        value: 'no',
        color: 'default'
      }
    };
    const dialogRef = this.dialog.open(SimpleDialogComponent, { data: data });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.adminApi.deleteProcessBatch(batch.id).subscribe(result => {
          //console.log(result)
          this.router.navigate(['..'], { relativeTo: this.route });
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

}
