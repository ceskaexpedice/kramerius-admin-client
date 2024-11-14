import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from 'ngx-flexible-layout';

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
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FlexLayoutModule, 
    MatIconModule, MatTooltipModule, MatTableModule,
    MatFormFieldModule, MatInputModule, MatSelectModule
  ],
  selector: 'app-cdk-europeanou',
  templateUrl: './cdk-europeanou.component.html',
  styleUrls: ['./cdk-europeanou.component.scss']
})
export class CdkEuropeanouComponent implements OnInit {

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
