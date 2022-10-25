import { Component, OnInit } from '@angular/core';

export interface ProxyElement {
  name: string;
  code: string;
  state: boolean;
  action: any;
}

const ELEMENT_DATA: ProxyElement[] = [
  {name: 'Hydrogen', code: 'AXC 4948330', state: false, action: ''},
  {name: 'Helium', code: 'AXC 4948330', state: false, action: ''},
  {name: 'Lithium', code: 'AXC 4948330', state: true, action: ''},
  {name: 'Beryllium', code: 'AXC 4948330', state: false, action: ''},
  {name: 'Boron', code: 'AXC 4948330', state: true, action: ''},
  {name: 'Carbon', code: 'AXC 4948330', state: true, action: ''},
  {name: 'Nitrogen', code: 'AXC 4948330', state: true, action: ''},
  {name: 'Oxygen', code: 'AXC 4948330', state: false, action: ''},
  {name: 'Fluorine', code: 'AXC 4948330', state: true, action: ''},
  {name: 'Neon', code: 'AXC 4948330', state: true, action: ''},
];

@Component({
  selector: 'app-cdk-proxy',
  templateUrl: './cdk-proxy.component.html',
  styleUrls: ['./cdk-proxy.component.scss']
})
export class CdkProxyComponent implements OnInit {

  displayedColumns: string[] = ['name', 'code', 'state'];
  dataSource = ELEMENT_DATA;

  constructor() { }

  ngOnInit(): void {
  }
}
