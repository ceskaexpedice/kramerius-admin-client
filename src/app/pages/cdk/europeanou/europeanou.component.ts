import { Component, OnInit } from '@angular/core';

const ELEMENT_DATA: any[] = [
  {license: null, icon: null, licenseLink: null, licenseEuro: null, action: null},
  {license: null, icon: null, licenseLink: null, licenseEuro: null, action: null},
  {license: null, icon: null, licenseLink: null, licenseEuro: null, action: null},
  {license: null, icon: null, licenseLink: null, licenseEuro: null, action: null},
  {license: null, icon: null, licenseLink: null, licenseEuro: null, action: null},
  {license: null, icon: null, licenseLink: null, licenseEuro: null, action: null},
  {license: null, icon: null, licenseLink: null, licenseEuro: null, action: null},
]; 

@Component({
  selector: 'app-europeanou',
  templateUrl: './europeanou.component.html',
  styleUrls: ['./europeanou.component.scss']
})
export class EuropeanouComponent implements OnInit {

  displayedColumns: string[] = ['license', 'icon', 'licenseLink', 'licenseEuro', 'action'];
  dataSource = ELEMENT_DATA;

  public selected: any[];

  licensesEuro: any[] = [
    {
      id: 'InC',
      name: 'In copyright',
    },
    {
      id: 'InC-OW-EU',
      name: 'In copyright - EU orphan work'
    },
    {
      id: 'InC-EDU',
      name: 'In copyright" - educational use permitted'
    },
    {
      id: 'InC-NC',
      name: 'In copyright - none-commercial use premitted'
    },
    {
      id: 'InC-RUU',
      name: 'In copyright - rights-holder(s) unlocatable or unidentifiable'
    },
    {
      id: 'NoC-CR',
      name: 'No copyright - contractual restrictions'
    },
    {
      id: 'NoC-NC',
      name: 'No copyright - none-commercial use only'
    },
    {
      id: 'NoC-OKLR',
      name: 'No copyright - other known legal restrictions'
    },
    {
      id: 'NoC-US',
      name: 'No copyright - united states'
    },
    {
      id: 'CNE',
      name: 'Copyright not evaluated'
    },
    {
      id: 'UND',
      name: 'Copyright undetermined'
    },
    {
      id: 'NKC',
      name: 'No known copyright'
    }
  ]
  
  constructor() { }

  ngOnInit(): void {
  }

}
