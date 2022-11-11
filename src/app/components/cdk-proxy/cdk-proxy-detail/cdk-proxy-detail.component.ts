import { Component, OnInit } from '@angular/core';

export interface PeriodicElement { // TO DO: SMAZAT
  date: string;
  indexed: string;
  updated: string;
  error: string;
}

const ELEMENT_DATA: PeriodicElement[] = [ // TO DO: SMAZAT
  {date: '23.5.2003', indexed: 'Ano', updated: 'Ne', error: '404'},
  {date: '23.5.2003', indexed: 'Ano', updated: 'Ne', error: '404'},
  {date: '23.5.2003', indexed: 'Ano', updated: 'Ne', error: '404'},
  {date: '23.5.2003', indexed: 'Ano', updated: 'Ne', error: '404'}
];

@Component({
  selector: 'app-cdk-proxy-detail',
  templateUrl: './cdk-proxy-detail.component.html',
  styleUrls: ['./cdk-proxy-detail.component.scss']
})
export class CdkProxyDetailComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  displayedColumns: string[] = ['date', 'indexed', 'updated', 'error'];
  dataSource = ELEMENT_DATA;

}
