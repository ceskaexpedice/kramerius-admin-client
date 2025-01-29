import { Component } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { TranslateModule } from '@ngx-translate/core';
import {MatListModule} from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgClass } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

const ELEMENT_DATA: any = [
  {date_start: 'neco', date_end: 'neco', duration: 'neco', parent_source: 'neco', endpoint_url: 'neco', query_param: 'neco', labels: 'neco', userid: 'neco', pid: 'neco', http_method: 'neco'},
  {date_start: 'neco', date_end: 'neco', duration: 'neco', parent_source: 'neco', endpoint_url: 'neco', query_param: 'neco', labels: 'neco', userid: 'neco', pid: 'neco', http_method: 'neco'},
  {date_start: 'neco', date_end: 'neco', duration: 'neco', parent_source: 'neco', endpoint_url: 'neco', query_param: 'neco', labels: 'neco', userid: 'neco', pid: 'neco', http_method: 'neco'},
  {date_start: 'neco', date_end: 'neco', duration: 'neco', parent_source: 'neco', endpoint_url: 'neco', query_param: 'neco', labels: 'neco', userid: 'neco', pid: 'neco', http_method: 'neco'},
  {date_start: 'neco', date_end: 'neco', duration: 'neco', parent_source: 'neco', endpoint_url: 'neco', query_param: 'neco', labels: 'neco', userid: 'neco', pid: 'neco', http_method: 'neco'}
];

@Component({
  selector: 'app-monitoring-api',
  standalone: true,
  imports: [MatRadioModule, MatExpansionModule, TranslateModule, MatListModule, MatIconModule, MatButtonModule, NgClass, MatTableModule
  ],
  templateUrl: './monitoring-api.component.html',
  styleUrl: './monitoring-api.component.scss'
})
export class MonitoringApiComponent {

  displayedColumns: string[] = ['date_start', 'date_end', 'duration', 'parent_source', 'endpoint_url', 'query_param', 'labels', 'userid', 'pid', 'http_method'];
  dataSource = ELEMENT_DATA;

  public isIncludeSelected: boolean = false;
  public isExcludeSelected: boolean = false;

  setButtonSelection(type: any) {
    if(type === 'include') {
      this.isIncludeSelected =! this.isIncludeSelected;
    } else if (type === 'exclude') {
      this.isExcludeSelected =! this.isExcludeSelected;
    }
  }
}
