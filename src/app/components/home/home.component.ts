import { Component, OnInit } from '@angular/core';
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

  dateFrom: Date = null;
  dateTo: Date = null;
  license:string = null;
  allLicenses:string[];

  // tabulka
  table: any;

  public isResult: boolean = true;

  // pripojena instance
  constructor(public appSettings: AppSettings, private adminApi: AdminApiService) { }



  reinitGraphs() {
    let requestedLicense = this.license != null && this.license !== 'All' ? this.license : null;

    // authors graph configuration
    this.adminApi.statisticsAuthors(
      this.dateFrom != null ? this.format(this.dateFrom) : null, 
      this.dateTo != null ? this.format(this.dateTo) : null,
      requestedLicense
    ).subscribe(response=> {
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

}
