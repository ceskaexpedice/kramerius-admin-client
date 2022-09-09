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
import { ClientApiService } from 'src/app/services/client-api.service';
import parse from 'xml-parser';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UIService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {

  // vybrane modely
  models = ["monograph","periodical","soundrecording"];

  // konfigurace grafu 
  modelsOpts: EChartsOption = {};
  langOpts: EChartsOption = {};
  authorOpts: EChartsOption = {};

  dateTo: Date = new Date(new Date().getFullYear(), new Date().getMonth(),new Date().getDate()+1);
  dateFrom: Date = new Date(new Date().getFullYear(), new Date().getMonth()-1,new Date().getDate());
  license:string = null;

  allLicenses:string[];

  identifier:string;

  isPageStatistics: boolean = false;

  
  // Debouncing 
  private subject: Subject<string> = new Subject();

  // tabulka 
  table: any;
  descriptions: any = {};

  view: string;

  public selection: any = [];

  public isResultModel: boolean = false;
  public isResultLang: boolean = false;
  public isResultAuthor: boolean = false;

  // pripojena instance
  constructor(
    public appSettings: AppSettings, 
    private adminApi: AdminApiService, 
    private clientApi: ClientApiService, 
    @Inject(DOCUMENT) private document: Document, 
    private local: LocalStorageService,
    private router: Router,
    private ui: UIService) { }

  reinitGraphs() {
  
    let requestedLicense = this.license != null && this.license !== 'All' ? this.license : null;

    this.adminApi.statisticsLicenseFilter(
      this.dateFrom != null ? this.format(this.dateFrom) : null, 
      this.dateTo != null ? this.format(this.dateTo) : null,
      requestedLicense, this.identifier
    ).subscribe(response => {
      this.allLicenses = response["license"];
      this.allLicenses.unshift('All');
    });


    // authors graph configuration
    this.adminApi.statisticsAuthors(
      this.dateFrom != null ? this.format(this.dateFrom) : null, 
      this.dateTo != null ? this.format(this.dateTo) : null,
      requestedLicense, this.identifier
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
      requestedLicense, this.identifier
   ).subscribe(response=> {
      this.isResultLang = response && response.length > 0;
      if (response) {
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
  
      } else {
        this.langOpts = {
          xAxis: {
            type: 'category',
            data: []
          },
          yAxis: {
          },
          tooltip: {
            trigger: 'item'
          },
  
          series: [
            {
              data: [],
              type: 'bar'
            }
          ]
        }
      }
    });

    // models pie graph configuration
    this.adminApi.statisticsModels(
      this.dateFrom != null ? this.format(this.dateFrom) : null, 
      this.dateTo != null ? this.format(this.dateTo) : null,
      requestedLicense, this.identifier
    ).subscribe(response => {
      this.isResultModel = Object.keys(response.sums).length > 0;

      this.table = response;

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
    this.view = this.local.getStringProperty('statistics.view', 'statistics');

    this.reinitGraphs();

    this.subject.pipe(
      debounceTime(400)
    ).subscribe(searchTextValue => {
      console.log("Changing event");
      this.reinitGraphs();
    });

    if (this.router.url.replace('/', '') === 'statistics') {
      return this.isPageStatistics = true;
    }
  }

  onIdentKeyUp(target) {
    this.subject.next(target.value);
  }

  clearIdentifier(target) {
    this.identifier = null;
    this.subject.next(target.value);
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
      u = u + (u.endsWith("?")  ?  "" : "&") + "dateTo="+fdat;
    } 
    if (this.license && this.license !== 'All') {
      u = u + (u.endsWith("?")  ?  "" : "&") + "license="+this.license;
    }
    console.log("url is "+url);
    this.document.location.href = u;
  }


  changeView(view: string) {
    this.view = view;
    this.local.setStringProperty('statistics.view', view);
    this.router.navigate(['/statistics/', view]);
  }

  showMore(id: string) {
    if (this.selection[id]) {
      this.selection[id] =! this.selection[id];
    } else {
      this.selection[id] = true;
    }

    if (this.selection[id]) {
      // TODO: Do it better
      this.clientApi.getModsNewApi(id).subscribe(mr=> {
        let modsFields = {};
        let ast = parse(mr);
        let mods = ast.root.children[0];

          // author
        let personal = this.elms(mods,'name','type',null);
        if (personal) {
          let author = personal.map(element => {
            let nameParts = this.elms(element, 'namePart', null, null);
            nameParts = nameParts.filter((p)=> {
              return (!p.attributes['type']) ||  (p.attributes['type'] && p.attributes['type'] !=='date')
            });
            let f = this.texts(nameParts);  
            return f ? f : '';
          }).join(', ');

          modsFields['author'] = author;
        }

        //   nakladatelske udaje
        let originInfo = this.elms(mods,'originInfo',null, null);
        if (originInfo) {
          let oinfo = originInfo.map(element => {
            let nameParts = this.elms(element, 'publisher', null, null);
            let f = this.texts(nameParts);  
            return f ? f : '';
          }).join(', ');

          modsFields['origininfo'] = oinfo;
        }

        //abstract
        let abstract = this.elms(mods,'abstract',null,null);
        if (abstract) {
          let f = this.texts(abstract);  
          modsFields['abstract'] = f ? f : '';
        }        
        // poznamka
        let note = this.elms(mods, 'note', null, null);
        if (note) {
          let f = this.texts(note);  
          modsFields['note'] = f ? f : '';
        }  

        //issn
        let issn = this.elms(mods, 'identifier', 'type', 'issn');
        if (issn) {
          let f = this.texts(issn);  
          modsFields['issn'] = f ? f : '';
        }

        //isbn
        let isbn = this.elms(mods, 'identifier', 'type', 'isbn');
        if (isbn) {
          let f = this.texts(isbn);  
          modsFields['isbn'] = f ? f : '';
        }

        //barcode
        let barcode = this.elms(mods, 'identifier', 'type', 'barcode');
        if (barcode) {
          let f = this.texts(barcode);  
          modsFields['barcode'] = f ? f : '';
        }

        //uuid
        let uuid = this.elms(mods, 'identifier', 'type', 'uuid');
        if (uuid) {
          let f = this.texts(uuid);  
          modsFields['uuid'] = f ? f : '';
        }

        // langs
        let langs = this.elms(mods, 'language',null, null);
        if (langs) {
          let tl = langs.map(element => {
            let term = this.elms(element, 'languageTerm', 'authority', 'iso639-2b');
            let f = this.texts(term);  
            return f ? f : '';
          });
          modsFields['langs'] = tl;
        }

        // subject - klicova slova
        let keywords = this.elms(mods, 'subject',null, null);
        if (keywords) {
          let tl = keywords.map(element => {
            let term = this.elms(element, 'topic', null, null);
            let f = this.texts(term);  
            return f ? f : '';
          });
          let filtered = [];
          tl.forEach(k=> {
            if (k !== '' && !filtered.includes(k)) {
              filtered.push(k);
            }
          });
          modsFields['keywords'] = filtered;
        }

        // location 
        let location = this.elms(mods, 'location',null, null);
        if (location) {
          let tl = location.map(element => {
            let term = this.elms(element, 'physicalLocation', null, null);
            let f = this.texts(term);  
            return f ? f : '';
          });
          modsFields['location'] = tl;
        }

        //physicalDescription
        let physicalDescription = this.elms(mods, 'physicalDescription',null, null);
          if (physicalDescription) {
          let desc = '';
          let tl = physicalDescription.forEach(element => {
            let ext = this.elms(element, 'extent', null, null);
            if (ext) {
                let tt = this.texts(ext);
                desc ='Rozsah:' +  this.texts(ext);
            }
          });
          modsFields['physicalDescription'] = desc;
        }

        this.descriptions[id] = modsFields;
      });
   }
  }
    
  /** Utilitni metody ??  Presunout ?? */

    // date formatting 
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

    private texts(elms) {
      let texts = elms.map(elm=> {
        return elm.content;
      });
      return texts.join(' ');      
    }

    private first(parent, name) {
      let first = parent.children.find((obj)=> {
        return obj.name === name || obj.name.includes(':'+name);
      });     
      return first;     
    }

    private elms(parent, name,  attrName, attrValue) {
      let elms = parent.children.filter((obj)=> {
        return obj.name === name || obj.name.includes(':'+name);
      });     
      if (attrName != null) {
        let tt =  elms.filter((obj)=> {
          if (attrValue != null) {
            return obj.attributes[attrName] === attrValue;
          } else {
            return attrName in obj.attributes;
          }
        });
        return tt;  
      } else return elms;
    }
}
