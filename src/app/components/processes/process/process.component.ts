import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { Process } from 'src/app/models/process.model';
import { Batch } from 'src/app/models/batch.model';

@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.scss']
})
export class ProcessComponent implements OnInit {

  processId;

  batch: Batch;
  process: Process;

  constructor(private route: ActivatedRoute, private api: ApiService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.processId = params['id'];
      // fetch process detail
      this.api.getProcess(this.processId)
        .subscribe(
          ([batch, process]: [Batch, Process]) => {
            this.batch = batch;
            this.process = process;
            //TODO: showing logs (out or err) with pagination in own component
            this.fetchLogsOut();
            this.fetchLogsErr();
          }
        );
    })
  }

  fetchLogsOut() {
    const offset = 0;
    const limit = 4096;
    this.api.getProcessLogsOut(this.process.uuid, offset, limit).subscribe(result => {
      //TODO: zobrazit
      console.log(result);
    });
  }

  fetchLogsErr() {
    const offset = 0;
    const limit = 4096;
    this.api.getProcessLogsErr(this.process.uuid, offset, limit).subscribe(result => {
      //TODO: zobrazit
      console.log(result);
    });
  }

}
