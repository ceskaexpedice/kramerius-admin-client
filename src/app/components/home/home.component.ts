import { Component, Inject, OnInit } from '@angular/core';
import { AppSettings } from 'src/app/services/app-settings';
import * as gitInfo from 'git-info.json'
import { ECharts, EChartsOption } from 'echarts';
import { AdminApiService } from 'src/app/services/admin-api.service';
import 'echarts/lib/chart/line'
import 'echarts/lib/chart/bar'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
import 'echarts/theme/macarons.js';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { License } from 'src/app/models/license.model';
import { DOCUMENT } from '@angular/common';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  // vybrane modely
  models = ["monograph","periodical","soundrecording"];

  // konfigurace grafu 
  modelsOpts: EChartsOption = {};
  langOpts: EChartsOption = {};
  authorOpts: EChartsOption = {};

  dateTo: Date = new Date();
  dateFrom: Date = new Date(this.dateTo.getFullYear(), this.dateTo.getMonth()-1,this.dateTo.getDate());
  license:string = null;
  allLicenses:string[];

  // tabulka
  table: any;

  view: string;

  public selection: any = [];

  public isResultModel: boolean = false;
  public isResultLang: boolean = false;
  public isResultAuthor: boolean = false;

  // pripojena instance
  constructor(public appSettings: AppSettings, private adminApi: AdminApiService, @Inject(DOCUMENT) private document: Document, private local: LocalStorageService) { }



  reinitGraphs() {
    let requestedLicense = this.license != null && this.license !== 'All' ? this.license : null;

    // authors graph configuration
    this.adminApi.statisticsAuthors(
      this.dateFrom != null ? this.format(this.dateFrom) : null, 
      this.dateTo != null ? this.format(this.dateTo) : null,
      requestedLicense
    ).subscribe(response=> {
      this.isResultAuthor = response && response.length > 0;
      this.authorOpts = {
        xAxis: {
          type: 'category',
          data: response.map(item=> {
            return item.author_name;
          })
        },
        yAxis: {
        },
        tooltip: {
          trigger: 'item'
        },

        series: [
          {
            data: response.map(item=> {
              return item.count;
            }),
            type: 'bar'
          }
        ]
      };
    });

    // lang graph configuration
    this.adminApi.statisticsLang(
      this.dateFrom != null ? this.format(this.dateFrom) : null, 
      this.dateTo != null ? this.format(this.dateTo) : null,
      requestedLicense
   ).subscribe(response=> {
      this.isResultLang = response && response.length > 0;
      this.langOpts = {
        xAxis: {
          type: 'category',
          data: response.map(item=> {
            return item.lang;
          })
        },
        yAxis: {
        },
        tooltip: {
          trigger: 'item'
        },

        series: [
          {
            data: response.map(item=> {
              return item.count;
            }),
            type: 'bar'
          }
        ]
      };
    });
    // models pie graph configuration
    this.adminApi.statisticsModels(
      this.dateFrom != null ? this.format(this.dateFrom) : null, 
      this.dateTo != null ? this.format(this.dateTo) : null,
      requestedLicense
    ).subscribe(response => {
      this.isResultModel = Object.keys(response.sums).length > 0;
      this.table =response;
      this.modelsOpts = {
        legend: {
          type:"scroll"
        },
        tooltip: {
          trigger: 'item'
        },

        series: {
          type: 'pie',
          label: {
            show: false,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            },
            label: {
                show: false
            }
          },
          data: Object.keys(response.sums).map(key => {
            return {
              value: response.sums[key],
              name: key
            }
          })
        }
      };
  
    });

  }

  ngOnInit() {
    this.view = this.local.getStringProperty('home.view', 'statistics');

    this.reinitGraphs();
    this.adminApi.getLicenses().subscribe((licenses: License[]) => {
      this.allLicenses = licenses.map(l=> {
        return l.name;
      });
      this.allLicenses.unshift('All');
    });
  }


  
  getVersion() {
    return this.appSettings.version;
  }

  getUserClientUrl() {
    return this.appSettings.userClientBaseUrl;
  }

  getCoreUrl() {
    return this.appSettings.coreBaseUrl;
  }

  getLastCommitHash() {
    const info = gitInfo;
    //console.log(info)
    const hash = info.hash ? info.hash
      : info['default'].hash.substring(1); //pokud je to jeste v objektu "default", je hash prefixovan 'g', viz git-info.json (generovan pred buildem)
    //console.log(hash)
    return hash;
  }

  changeEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    console.log("Changing event");
    this.reinitGraphs();
  }

  onChartClick(event) {
    console.log(event.name);
  }

  csvModels() {
    let url = this.appSettings.adminApiBaseUrl+'/statistics/summary';
    this.goto(url);

  }
  csvAuthor() {
    let url = this.appSettings.adminApiBaseUrl+'/statistics/author';
    this.goto(url);

  }
  csvLang() {
    let url = this.appSettings.adminApiBaseUrl+'/statistics/lang';
    this.goto(url);
  }

  goto(url:string) {
    let u = url + "/export/csv";
    if (this.dateFrom || this.dateTo || this.license) {
      u = u +"?";
    }
    if (this.dateFrom) {
      let fdat = this.format(this.dateFrom);

      u = u + "dateFrom="+(u.endsWith("?") ? fdat : fdat) ;
    }
    if (this.dateTo) {
      let fdat = this.format(this.dateTo);
      u = u + "&dateFrom="+ (u.endsWith("?") ? fdat : fdat) ;
    } 
    if (this.license) {
      u = u + "&license="+  (u.endsWith("?") ? this.license : "&"+this.license) ;
    }
    this.document.location.href = u;
  }

  // date formatting - presunout
  private format(date) {
    let d = new Date(date);
    let month = (d.getMonth() + 1).toString();
    let day = d.getDate().toString();
    let year = d.getFullYear();
    if (month.length < 2) {
      month = '0' + month;
    }
    if (day.length < 2) {
      day = '0' + day;
    }
    return [year, month, day].join('.');
  }

  changeView(view: string) {
    this.view = view;
    this.local.setStringProperty('home.view', view);
  }

  showMore(id: number) {
    if (this.selection[id]) {
      this.selection[id] =! this.selection[id];
    } else {
      this.selection[id] = true;
    }
  }

}
