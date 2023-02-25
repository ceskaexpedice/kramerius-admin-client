import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-schedule-sync-with-sdnnt',
  templateUrl: './schedule-sync-with-sdnnt.component.html',
  styleUrls: ['./schedule-sync-with-sdnnt.component.scss']
})
export class ScheduleSyncWithSdnntComponent implements OnInit {
  displayedColumns = ['library', 'uuid', 'name', 'licenseIn', 'licenseOut'];
  dataSource = ELEMENT_DATA;

  constructor() { }

  ngOnInit(): void {
  }

}

export interface PeriodicElement {
  library: string;
  uuid: string;
  name: string,
  licenseIn: string;
  mark: string;
  licenseOut: string;
  children: any;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {library: 'KNAV', uuid: 'k7_edit_39af4403-7fe0-401b-bde0-7af7b643444b', name: 'Babicka, Bozena', licenseIn: 'public', mark: '', licenseOut: 'dnnto', children: null},
  {library: 'NK', uuid: 'k7_edit_27e9b923-59d8-11ed-a227-001b63bd97ba', name: 'Zeptej se taty, Balaban', licenseIn: 'dnnto',  mark: '', licenseOut: 'private', children: null},
  {library: 'MZK', uuid: 'k4_e38ecda4-9cf5-4290-87dd-f22a90128eaa', name: 'Lidove noviny', licenseIn: 'dnnto',  mark: '', licenseOut: 'dnnto', children: [
    {rocnik: 'rocnik 1922', licenseOut: 'odebira se mu dnntt'},
    {rocnik: 'rocnik 1923', licenseOut: 'pridava se mu dnnto'},
    {rocnik: 'rocnik 1924', licenseOut: 'dnnto se meni na dnntt'}
  ]}
];
