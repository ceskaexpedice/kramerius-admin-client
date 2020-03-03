import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { Process } from 'src/app/models/process.model';
import { Batch } from 'src/app/models/batch.model';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { MatDialog } from '@angular/material';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';

@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.scss']
})
export class ProcessComponent implements OnInit {

  processId;

  batch: Batch;
  process: Process;

  constructor(private route: ActivatedRoute, private api: ApiService, private dialog: MatDialog, private router: Router) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.processId = params['id'];
      this.reload();
    })
  }

  reload() {
    // fetch process detail
    this.api.getProcess(this.processId)
      .subscribe(
        ([batch, process]: [Batch, Process]) => {
          this.batch = batch;
          this.process = process;
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
        // TODO: kill process and reload data
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
        this.api.deleteProcessBatch(batch.id).subscribe(result => {
          //console.log(result)
          this.router.navigate(['..'], { relativeTo: this.route });
        });
      }
    });
  }

}
