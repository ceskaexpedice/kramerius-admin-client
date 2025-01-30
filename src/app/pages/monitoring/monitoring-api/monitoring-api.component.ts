import { Component, OnInit } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { TranslateModule } from '@ngx-translate/core';
import {MatListModule} from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgClass } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { CdkApiService } from 'src/app/services/cdk-api.service';
import { FactoryTarget } from '@angular/compiler';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import {FilterType, Filter,FacetFilters,  FacetValue, FacetsGroup} from './filters';


@Component({
  selector: 'app-monitoring-api',
  standalone: true,
  imports: [MatRadioModule, MatExpansionModule, TranslateModule, MatListModule, MatIconModule, MatButtonModule, NgClass, 
    MatTableModule,
    CommonModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './monitoring-api.component.html',
  styleUrl: './monitoring-api.component.scss'
})
export class MonitoringApiComponent implements OnInit {

  displayedColumns: string[] = ['startTime',  'duration', 'resource', 'endpoint', 'querypart', 'labels', 'userId', 'pid', 'httpMethod'];
  dataSource:any;

  workers:any;
  labels:any;
  resources:any;

  groups:FacetsGroup = {};
  facetFilters:FacetFilters = {};

  constructor(    
    private adminApi: AdminApiService,
    private cdkApi : CdkApiService
  ) {}

  ngOnInit() {
    this.reloadAPIItems();
  }


  reloadAPIItems() {
    
    let filters= Object.values( this.facetFilters).map(f=> f.facetval);

    this.cdkApi.apiMonitorSearch(null, null, filters).subscribe(
      {
        next: (resp:any)=>{

          this.dataSource =  resp?.response?.docs || [];;
          this.groups = {};

          if (resp?.facet_counts && resp.facet_counts.facet_fields) {
            console.log(resp.facet_counts.facet_fields);
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
      this.facetFilters[facet.groupid]= null;
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
      this.facetFilters[facet.groupid]= null;
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

}
