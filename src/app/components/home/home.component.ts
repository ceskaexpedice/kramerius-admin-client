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

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  modelsOpts: EChartsOption = {};
  langOpts: EChartsOption = {};
  authorOpts: EChartsOption = {};

  constructor(private appSettings: AppSettings,
              private adminApi: AdminApiService) { }

  ngOnInit() {
    this.adminApi.statisticsAuthors().subscribe(response=> {
      this.authorOpts = {
        xAxis: {
          type: 'category',
          data: response.map(item=> {
            return item.author_name;
          })
        },
        yAxis: {
          type: 'value'
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
      console.log(response);
    });


    this.adminApi.statisticsLang().subscribe(response=> {
      this.langOpts = {
        xAxis: {
          type: 'category',
          data: response.map(item=> {
            return item.lang;
          })
        },
        yAxis: {
          type: 'value'
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
    this.adminApi.statisticsModels().subscribe(response => {
     
      this.modelsOpts = {
        title: {
          text: "Zobrazeni modelu", 
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        series: {
          name: "Zobrazeni modelu",
          type: 'pie',
          radius: '50%',
          // center: ['40%', '50%'],
          label: {
            show: false,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          data: Object.keys(response.sums).map(key => {
            return {
              value: response.sums[key],
              name: key
            }
          })
        },
        
        legend: {
          orient: 'vertical',
          left: 'left'
        }
      };
  
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

  // generovane grafy 


}
