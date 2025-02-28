import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { StatusTimtamp } from 'src/app/models/cdk.library.model';
import { CdkApiService } from 'src/app/services/cdk-api.service';

export interface PeriodicElement { // TO DO: SMAZAT
  date: string;
  indexed: string;
  updated: string;
  error: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, 
    MatIconModule, MatTooltipModule, MatTableModule
  ],
  selector: 'app-cdk-proxy-detail',
  templateUrl: './cdk-proxy-detail.component.html',
  styleUrls: ['./cdk-proxy-detail.component.scss']
})
export class CdkProxyDetailComponent implements OnInit {

  debug = false;

  mockTimestamps:any= {
    "knav": [{"date":"2022-11-20T00:00:00Z","batches":0,"indexed":270,"name":"knav","id":"knav_1669330116640","type":"full","updated":0,"workers":0},{"date":"2022-11-24T22:52:29.129Z","batches":0,"indexed":0,"name":"knav","id":"knav_1669330349129","updated":0,"workers":0},{"date":"2022-11-24T22:55:05.172Z","batches":0,"indexed":0,"name":"knav","id":"knav_1669330505172","updated":0,"workers":0},{"date":"2022-11-24T22:57:23.755Z","batches":0,"indexed":0,"name":"knav","id":"knav_1669330643755","updated":0,"workers":0},{"date":"2022-11-24T23:04:35.654Z","batches":0,"indexed":0,"name":"knav","id":"knav_1669331075654","updated":0,"workers":0},{"date":"2022-11-24T23:04:46.836Z","batches":0,"indexed":0,"name":"knav","id":"knav_1669331086836","updated":0,"workers":0},{"date":"2022-11-24T23:15:49.451Z","batches":0,"indexed":0,"name":"knav","id":"knav_1669331749451","updated":0,"workers":0}],
    "mzk":[],
    "skvul":[],
  }

  dataSource:StatusTimtamp[];
  title:string ='';

  constructor(private cdkApi: CdkApiService,
    private router: Router,
    private route: ActivatedRoute,
    ) {

  }

  ngOnInit(): void {

    this.route.params.subscribe(params => {
      this.title = params['id'];   
         
      if (this.debug) {
        if (this.mockTimestamps[params['id']]) {
          this.dataSource = StatusTimtamp.statusesFromJson(this.mockTimestamps[params['id']]);
          this.title = 'Mock title '+params['id'];
        }
      } else {
        this.cdkApi.timestamps(params['id']).subscribe(resp=> {
          this.dataSource = resp;        
        });
  
        this.cdkApi.oneRegistrinfo(params['id']).subscribe(resp=> {
            this.title = resp.name;
        });
  
      }
    });
  }

  displayedColumns: string[] = ['date','type', 'indexed', 'updated', 'error'];
}
