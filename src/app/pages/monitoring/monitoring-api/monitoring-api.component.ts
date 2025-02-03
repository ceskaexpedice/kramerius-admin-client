import { Component, OnInit } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { TranslateModule } from '@ngx-translate/core';
import {MatListModule} from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DatePipe, NgClass } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { CdkApiService } from 'src/app/services/cdk-api.service';
import { FactoryTarget } from '@angular/compiler';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import {FilterType, Filter,FacetFilters,  FacetValue, FacetsGroup} from './filters';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from 'ngx-flexible-layout';
import { MatInputModule } from '@angular/material/input';
import { MonitoringApiDetailComponent } from 'src/app/dialogs/monitoring-api-detail/monitoring-api-detail.component';
import { MatDialog } from '@angular/material/dialog';

/*
  imports: [CommonModule, TranslateModule, FlexLayoutModule, FormsModule, MatDialogModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatDatepickerModule,
   MatTooltipModule],
*/


@Component({
  selector: 'app-monitoring-api',
  standalone: true,
  imports: [MatRadioModule, 
    MatExpansionModule, 
    TranslateModule, MatListModule, 
    MatIconModule, MatButtonModule, NgClass, 
    MatTableModule,
    CommonModule,
    MatTooltipModule,
    MatChipsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    FormsModule, 
    FlexLayoutModule,
    MatInputModule,
    MatDatepickerModule
  ],
  providers: [DatePipe],
  templateUrl: './monitoring-api.component.html',
  styleUrl: './monitoring-api.component.scss'
})
export class MonitoringApiComponent implements OnInit {

  displayedColumns: string[] = ['startTime',  'duration', 'resource', 'endpoint', 'labels', 'userId', 'pid', 'ipaddress', 'action'];
  dataSource:any;

  workers:any;
  labels:any;
  resources:any;

  dateFrom: Date; 
  dateTo: Date;   
  
  groups:FacetsGroup = {};
  facetFilters:FacetFilters = {};

  constructor(    
    private adminApi: AdminApiService,
    private cdkApi : CdkApiService,
    datePipe: DatePipe,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.reloadAPIItems();
  }


  reloadAPIItems() {
    let fqs = Object.values( this.facetFilters).map(f=> {
      let key = f.facetval.filterKey
      let val = f.facetval.filterVal === '*' ? '*' : `"${f.facetval.filterVal}"`;

      switch(f.type) {
        case '+': 
          return `${key}:${val}`
        break;
        case '-':
          return `NOT ${key}:${val}`
        break;
      }
    });

    this.cdkApi.apiMonitorSearch(this.dateFrom, this.dateTo, fqs).subscribe(
      {
        next: (resp:any)=>{
          this.dataSource =  resp?.response?.docs || [];;
          this.groups = {};

          if (resp?.facet_counts && resp.facet_counts.facet_fields) {
            //console.log(resp.facet_counts.facet_fields);
            Object.keys(resp.facet_counts.facet_fields).forEach((groupKey:any)=>{
              // groupKey

              let arr = resp.facet_counts.facet_fields[groupKey];
              for (let i = 0; i < arr.length; i += 2) {
                const klic = arr[i];
                const hodnota = arr[i + 1];

                if (groupKey === 'labels' && klic.startsWith('node')) {
                  if (!this.groups["workers"]) {
                    this.groups["workers"]=[];
                  }
                  let facetVal:FacetValue = {
                    groupid: "workers",
                    filterKey: groupKey,
                    filterVal: klic,
                    name: klic,
                    value: hodnota
                  };
                  this.groups["workers"].push(facetVal);
                } else {

                  if (!this.groups[groupKey]) {
                    this.groups[groupKey]=[];
                  }
                  let facetVal:FacetValue = {
                    groupid: groupKey,
                    filterKey: groupKey,
                    filterVal: klic,
                    name: klic,
                    value: hodnota
                  };
                  this.groups[groupKey].push(facetVal);
                }
              }

          });
          }
        },
        error: (error: HttpErrorResponse) => {
        }
      });
  }


  isFilterSelected(facet:FacetValue, type:FilterType) {
    let selectedFromGroup = this.facetFilters[facet.groupid];
    return selectedFromGroup && 
      selectedFromGroup.facetval.filterKey == facet.filterKey &&
       selectedFromGroup.facetval.filterVal == facet.filterVal &&
       selectedFromGroup.type == type;
  }


  setButtonEnabledSelection(facet:FacetValue) {
    if (!this.isFilterSelected(facet, '+')) {
      let filterVal:Filter = {
        facetval: facet,
        type: '+'
      };
      this.facetFilters[facet.groupid] = filterVal;
    } else {
      delete this.facetFilters[facet.groupid];

    }
    this.reloadAPIItems();
  }

  setButtonDisabledSelection(facet:FacetValue) {
    if (!this.isFilterSelected(facet, '-')) {
      let filterVal:Filter = {
        facetval: facet,
        type: '-'
      };
      this.facetFilters[facet.groupid] = filterVal;
    } else {
      delete this.facetFilters[facet.groupid];
    }
    this.reloadAPIItems();
  }



  getLastSegment(path: string): string {
    if (path) {
      const trimmedPath = path.trim().replace(/\/+$/g, '');
      const parts = trimmedPath.split('/').filter(part => part !== '');
      return parts.length > 0 ? parts.pop() : '';
    } else return "";
  }

  hasQueryParams(element: any): boolean {
    return element.querypart?.length > 0; 
  }



  formatQueryParams(queryParams: string[]): string {
    if (!queryParams || queryParams.length === 0) return '';
    
    return queryParams
      .map(param => {
        try {
          const decoded = decodeURIComponent(param);
          return decoded.split('&').join('\n');
        } catch {
          return param; 
        }
      })
      .join('\n\n'); 
  }

  showMonitoringDetail() {
    const dialogRef = this.dialog.open(MonitoringApiDetailComponent, {
      width: '600px',
      panelClass: 'app-monitoring-api-detail-dialog'
    });
  }

}
