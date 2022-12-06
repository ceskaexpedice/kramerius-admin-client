import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StatusTimtamp } from 'src/app/models/cdk.library.model';
import { CdkApiService } from 'src/app/services/cdk-api.service';

export interface PeriodicElement { // TO DO: SMAZAT
  date: string;
  indexed: string;
  updated: string;
  error: string;
}

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
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
      this.cdkApi.timestamps(params['id']).subscribe(resp=> {
        this.dataSource = resp;        
      });

      this.cdkApi.oneRegistrinfo(params['id']).subscribe(resp=> {
          this.title = resp.name;
      });
    });
  }

  displayedColumns: string[] = ['date','type', 'indexed', 'updated', 'error'];
}
