import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
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
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import { GenerateNkpLogsDialogComponent } from 'src/app/dialogs/generate-nkp-logs-dialog/generate-nkp-logs-dialog.component';
import { DeleteStatisticsDialogComponent } from 'src/app/dialogs/delete-statistics-dialog/delete-statistics-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { FileDownloadService } from 'src/app/services/file-download';
import * as moment from 'moment';
import { IsoConvertService } from 'src/app/services/isoconvert.service';

/** Levely zobrazeni - master, detail, subdteial */
enum ViewLevel {
  master, detail 
}

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {

  @ViewChild('scrollelm') scrollelm!: ElementRef;

  level = ViewLevel.master;
  detailDoc = {}
  detailMods = null;
  deatilTypes = null;

  isMaster() { return this.level == ViewLevel.master; }
  isDetail() { return this.level == ViewLevel.detail; }


  // Top level modely
  topLevelModels = ["collection", "monograph", "periodical", "soundrecording", "map", "manuscript", "graphic", "archive", "convolute", "museumExhibit", "article","sheetmusic"];
  topLevelModelsColor = {
    "monograph":"#c73565",
    "periodical":"#167a1b",
    "collection":"#000",
    "graphic":"#dc2522",
    "map":"#735f32",
    "sheetmusic":"#7e4ad8",
    "soundrecording":"#af580b",
    "archive":"#144272",
    "convolute":"#7b4713"
  };

  // modely prvni urovne 
  detailModels = ["monographunit", "periodicalvolume",  "periodicalitem"]


  // konfigurace grafu 
  modelsOpts: EChartsOption = {};
  detailOpts: EChartsOption = {};

  langOpts: EChartsOption = {};
  authorOpts: EChartsOption = {};
  providedByLicensesOpts: EChartsOption = {};
  collectionsOpts: EChartsOption = {};

  filters: any[] = [];

  dateTo: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1);
  dateFrom: Date = new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate());
  license: string = null;

  allLicenses: string[];

  identifier: string;

  isPageStatistics: boolean = true;

  errorMessage: string;
  errorState: boolean = false;

  // Debouncing 
  private subject: Subject<string> = new Subject();

  // tabulka 
  table: any;
  tablekeys: string[] = [];
  descriptions: any = {};

  view: string;
  path: string;

  lang: string;


  public selection: any = [];

  public isResultTopLevelModel: boolean = false;

  public isDetailsData: boolean = false;
  //public isMonographUnits: boolean = false;

  //public isResultSecondtLevelItems: boolean = false;

  public isResultLang: boolean = false;
  public isResultAuthor: boolean = false;
  public isProvidedByLicense: boolean = false;
  public isCollections: boolean = false;


  private rememberColor: Map<string, string> = new Map();


  logfiles: any[] = [];

  // pripojena instance
  constructor(
    public appSettings: AppSettings,
    private adminApi: AdminApiService,
    private clientApi: ClientApiService,
    private isoConvert: IsoConvertService,
    private downloadService: FileDownloadService,
    @Inject(DOCUMENT) private document: Document,
    private local: LocalStorageService,
    private router: Router,
    private ui: UIService,
    private auth: AuthService,
    private dialog: MatDialog) { }



  extractNames(values: (string | number)[]): string[] {
    const names: string[] = [];
    for (let i = 0; i < values.length; i += 2) {
      const name = values[i] as string;
      names.push(name);
    }
    return names;
  }

  extractCounts(values: (string | number)[]): number[] {
    const counts: number[] = [];

    for (let i = 1; i < values.length; i += 2) {
      const count = values[i] as number;
      counts.push(count);
    }

    return counts;
  }


  reinitGraphs() {

    let facets = [];
    facets.push('provided_by_license');
    facets.push('authors');
    facets.push('langs');
    facets.push('all_models');


    this.adminApi.statisticsSearch(
      this.dateFrom != null ? this.dateFrom.toISOString() : null,
      this.dateTo != null ? this.dateTo.toISOString() : null,
      this.identifier, this.filters, ['provided_by_license', 'authors', 'langs', 'all_models']).subscribe(response => {
        if (response['facet_counts']) {

          // authors 
          let authors = response['facet_counts']['facet_fields']['authors'];
          let authorCounts = this.extractCounts(authors);
          let authorNames = this.extractNames(authors);
          this.reinitAuthorGraph(authorNames, authorCounts, authors);

          // langs
          let langs = response['facet_counts']['facet_fields']['langs'];
          let langsCount = this.extractCounts(langs);
          let langsNames = this.extractNames(langs);
          this.reinitLangGraph(langsNames, langsCount, langs);

          // top level models
          let models = response['facet_counts']['facet_fields']['all_models'];
          let modelCounts = this.extractCounts(models);
          let modelNames = this.extractNames(models);
          this.reinitTopLevelModelGraph(modelNames, modelCounts);

          // detail models
          // let detailModels = response['facet_counts']['facet_fields']['all_models'];
          // let detailModelCounts = this.extractCounts(detailModels);
          // let detailModelNames = this.extractNames(detailModels);
          // this.reinitDetailModels(detailModelNames, detailModelCounts);

          // providedByLicenses
          let providedByLicenses = response['facet_counts']['facet_fields']['provided_by_license'];
          let providedLicensesCounts = this.extractCounts(providedByLicenses);
          let providedLicensesNames = this.extractNames(providedByLicenses);
          this.reinitProvidedLicensesGraph(providedLicensesNames, providedLicensesCounts);

          // check if pids_collection exists
          this.adminApi.statisticsSearch(
            null,
            null,
            null, [{
              data: {
                filterField: "pids_collection",
                filterValue: "*"
              }
            }], []).subscribe(response => {

              let pidModels = modelNames.slice().filter(item => this.topLevelModels.includes(item)).map(item => `pids_${item}`);
              if (response['response']['numFound'] && response['response']['numFound'] > 0) {
                pidModels.push("pids_collection");
              }

              if (this.level == ViewLevel.detail) {
                pidModels.push(...this.detailModels.map(m => `pids_${m}`));
              }

              this.adminApi.statisticsSearch(
                this.dateFrom != null ? this.dateFrom.toISOString() : null,
                this.dateTo != null ? this.dateTo.toISOString() : null,
                this.identifier, this.filters, pidModels).subscribe(response => {

                  this.deatilTypes='';

                  // collections
                  let collections = response['facet_counts']['facet_fields']['pids_collection'];
                  let collectionCounts = this.extractCounts(collections);
                  let collectionPids = this.extractNames(collections);
                  this.reinitCollectionsGraph(collectionPids, collectionCounts);

                  if (this.level != ViewLevel.master) {
                    let periodicalvolumes =  response['facet_counts']['facet_fields']['pids_periodicalvolume'];
                    let monographunits =  response['facet_counts']['facet_fields']['pids_monographunit'];
                    let periodicalitems =  response['facet_counts']['facet_fields']['pids_periodicalitem'];

                    switch(this.detailDoc['model']) {
                        case 'periodical':
                          if (periodicalvolumes && periodicalvolumes.length > 0) {
                            let periodicalvolumeCounts = this.extractCounts(periodicalvolumes);
                            let periodicalvolumePids = this.extractNames(periodicalvolumes);
                            this.reinitDetailsGraph(periodicalvolumePids, periodicalvolumeCounts);
                            this.deatilTypes = "periodicalvolume";
                          } else if (periodicalitems && periodicalitems.length > 0) {
                            let periodicalitemCount = this.extractCounts(periodicalitems);
                            let periodicalitemPids = this.extractNames(periodicalitems);
                            this.reinitDetailsGraph(periodicalitemPids, periodicalitemCount);
                            this.deatilTypes = "periodicalitem";
                          } else {  
                            this.reinitDetailsGraph([], []);
                          }
                          break;
                        case 'periodicalvolume':
                          if (periodicalitems && periodicalitems.length > 0) {
                            let periodicalitemCount = this.extractCounts(periodicalitems);
                            let periodicalitemPids = this.extractNames(periodicalitems);
                            this.reinitDetailsGraph(periodicalitemPids, periodicalitemCount);
                            this.deatilTypes = "periodicalitem";
                          } else {  
                            this.reinitDetailsGraph([], []);
                          }
                          break;
                        case 'monograph':
                          if (monographunits && monographunits.length > 0) {
                            let monographUnitCounts = this.extractCounts(monographunits);
                            let monographUnitPids = this.extractNames(monographunits);
                            this.reinitDetailsGraph(monographUnitPids, monographUnitCounts);
                            this.deatilTypes = "monographunit";
                          } else {  
                            this.reinitDetailsGraph([], []);
                          }
                          break;
                        default:
                          this.reinitDetailsGraph([], []);
                    }
                  }
                  //table top hits
                  this.reinitTopHitsTable(response);
                });

            });
        }
      }, (error: HttpErrorResponse) => {
        this.errorMessage = error.error.message;
        this.errorState = true;
      });
    // });
  }

  private reinitTopHitsTable(response: Object) {
    let models = [];
    models.push(...this.topLevelModels);
    if (this.level == ViewLevel.detail) {
      models.push(...this.detailModels);
    }

    this.table = new Map<string, any>();

    for (let i = 0; i < models.length; i++) {
      let tableFacets = response['facet_counts']['facet_fields'][`pids_${models[i]}`];
      if (tableFacets) {
        let values = [];
        let tablePids = this.extractNames(tableFacets);
        let tableCounts = this.extractCounts(tableFacets);
        let map: Map<string, number> = new Map();
        for (let j = 0; j < tablePids.length; j++) { map.set(tablePids[j], tableCounts[j]); }


        this.clientApi.getPids(tablePids, ['pid','model', 'title.search','date.str','model','root.pid','root.title','part.number.str']).subscribe(resp => {

          for (let k = 0; k < resp.length; k++) {
            let count = map.get(resp[k].pid);
            if (count > 0) {
              let val = {
                count: map.get(resp[k].pid),
                pid: resp[k].pid,
                title:  this.getIndexTitle(resp[k])  //resp[k]['title.search']
              };
              values.push(val);
            }
          }
          if (values.length > 0) {
            values.sort((a, b) => {
              return b.count - a.count;
            });
            this.table.set(models[i], values);
            this.tablekeys = models.filter(key => this.table.has(key));
          }
        });
      }
    }
  }




  private reinitDetailsGraph(detailpids: string[], detailcount: number[]) {

    let detailItems = [];
    this.clientApi.getPids(detailpids, ['pid','model', 'title.search*', 'root.title', 'date.str', 'title.search']).subscribe(docs => {
      let details = docs;
      for (let i = 0; i < details.length; i++) {
        let vol = details[i];
        let model =vol['model'];        

        let translated =  this.ui.getTranslation('desc.'+vol['model']);
        let volumeTitle = `${translated} -  ${vol['date.str']} / ${vol['title.search']}`;

        let detailItem = {
          value: detailcount[i],
          name: volumeTitle,
          filterField: `pids_${model}`,
          filterValue: vol['pid']
        };
        if (this.rememberColor.has(`${detailItem.filterField}_${detailItem.filterValue}`)) {
          let c = this.rememberColor.get(`${detailItem.filterField}_${detailItem.filterValue}`);
          detailItem["itemStyle"] = {
            color: c
          }
        }
        detailItems.push(detailItem);
      }
      this.isDetailsData = detailItems.length > 0;

      this.detailOpts = {
        xAxis: {
          type: 'category',
          data: detailItems.map(m => m.name)
        },
        yAxis: {
          type: 'log',
          name: 'Počet',
          logBase: 10
        },
        tooltip: {
          trigger: 'item'
        },

        series: [
          {
            data: detailItems,
            type: 'bar',
            showBackground: true
          }
        ]
      };
    });
  }


  private reinitCollectionsGraph(collectionPids: string[], collectionCounts: number[]) {
    let collectionItems = [];
    this.clientApi.getPids(collectionPids, ['pid', 'title.search*']).subscribe(docs => {
      let collections = docs;
      for (let i = 0; i < collections.length; i++) {
        let col = collections[i];
        let collectionTitle = col['title.search'];
        if (col[`search_${this.displayLanguage()}`]) {
          let titles = col[`search_${this.displayLanguage()}`];
          if (titles.length > 0) { collectionTitle = titles[0]; }
        }
        let colitem = {
          value: collectionCounts[i],
          name: collectionTitle,
          filterField: "pids_collection",
          filterValue: col['pid']
        };
        if (this.rememberColor.has(`${colitem.filterField}_${colitem.filterValue}`)) {
          let c = this.rememberColor.get(`${colitem.filterField}_${colitem.filterValue}`);
          colitem["itemStyle"] = {
            color: c
          }
        }
        collectionItems.push(colitem);
      }
      this.isCollections = collectionItems.length > 0;
      this.collectionsOpts = {

        legend: {
          type: 'scroll',
          orient: 'vertical',
          left: 10,
          top: 10,
          bottom: 'auto'
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
          data: collectionItems
        }
      };
    });
  }



  private reinitProvidedLicensesGraph(providedLicensesNames: string[], providedLicensesCounts: number[]) {
    let providedLicensesItems = [];
    for (let i = 0; i < providedLicensesNames.length; i++) {
      let obj = {
        value: providedLicensesCounts[i],
        name: providedLicensesNames[i],
        filterField: "provided_by_license",
        filterValue: providedLicensesNames[i]
      };

      if (this.rememberColor.has(`${obj.filterField}_${obj.filterValue}`)) {
        let c = this.rememberColor.get(`${obj.filterField}_${obj.filterValue}`);
        obj["itemStyle"] = {
          color: c
        }
      }
      providedLicensesItems.push(obj);

    }

    this.isProvidedByLicense = providedLicensesItems.length > 0;
    this.providedByLicensesOpts = {
      legend: {
        type: 'scroll',
        orient: 'vertical',
        left: 10,
        top: 10,
        bottom: 'auto'
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
        data: providedLicensesItems
      }
    };
  }

  private reinitTopLevelModelGraph(modelNames: string[], modelCounts: number[]) {
    let topLevelModelItems = [];
    for (let i = 0; i < modelNames.length; i++) {
      if (this.topLevelModels.indexOf(modelNames[i]) >= 0) {
        let model = {
          value: modelCounts[i],
          name: modelNames[i],
          filterField: "all_models",
          filterValue: modelNames[i]
        };

        if (this.rememberColor.has(`${model.filterField}_${model.filterValue}`)) {
          let c = this.rememberColor.get(`${model.filterField}_${model.filterValue}`);
          model["itemStyle"] = {
            color: c
          }
        // } else {
        //   if (this.topLevelModelsColor[modelNames[i]]) {
        //     model["itemStyle"] = {
        //       color: this.topLevelModelsColor[modelNames[i]]
        //     }
        //   }
        }
        topLevelModelItems.push(model);
      }
    }
    this.isResultTopLevelModel = topLevelModelItems.length > 0;
    this.modelsOpts = {
      legend: {
        type: 'scroll',
        orient: 'vertical',
        left: 10,
        top: 10,
        bottom: 'auto'
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
        data: topLevelModelItems
      }
    };
  }

  private reinitLangGraph(langsNames: string[], langsCount: number[], langs: any) {
    let langsItems = [];
    for (let i = 0; i < langsNames.length; i++) {
      let lang = {
        value: langsCount[i],
        name: langsNames[i],
        filterField: "langs",
        filterValue: langsNames[i]
      };

      if (this.rememberColor.has(`${lang.filterField}_${lang.filterValue}`)) {
        let c = this.rememberColor.get(`${lang.filterField}_${lang.filterValue}`);
        lang["itemStyle"] = {
          color: c
        }
      }
      langsItems.push(lang);
    }
    this.isResultLang = langsItems.length > 0;
    this.langOpts = {
      xAxis: {
        type: 'category',
        data: this.extractNames(langs)
      },
      yAxis: {
        type: 'log',
        name: 'Počet',
        logBase: 10
      },
      tooltip: {
        trigger: 'item'
      },

      series: [
        {
          data: langsItems,
          type: 'bar',
          showBackground: true
        }
      ]
    };
  }

  /** Author graph */
  private reinitAuthorGraph(authorNames: string[], authorCounts: number[], authors: any) {
    let authorItems = [];
    for (let i = 0; i < authorNames.length; i++) {
      let auth = {
        value: authorCounts[i],
        name: authorNames[i],
        filterField: "authors",
        filterValue: authorNames[i]
      };
      if (this.rememberColor.has(`${auth.filterField}_${auth.filterValue}`)) {
        let c = this.rememberColor.get(`${auth.filterField}_${auth.filterValue}`);
        auth["itemStyle"] = {
          color: c
        }
      }
      authorItems.push(auth);
    }
    this.isResultAuthor = authorItems.length > 0;
    this.authorOpts = {
      xAxis: {
        type: 'category',

        data: this.extractNames(authors),
        axisTick: {
          show: false
        },
        axisLine: {
          show: false
        },
        z: 10
      },

      yAxis: {
        type: 'log',
        name: 'Počet',
        logBase: 10
      },
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          showBackground: true,
          data: authorItems,
          type: 'bar'
        }
      ]
    };
  }

  displayLanguage() {
    if (this.isoConvert.isTranslatable(this.lang)) {
      return this.isoConvert.convert(this.lang)[0];
    }
    return this.lang;
  }

  ngOnInit() {
    this.view = this.router.url.replace('/statistics/', '');
    this.lang = this.appSettings.defaultLang;
    this.reinitGraphs();
    this.subject.pipe(
      debounceTime(400)
    ).subscribe(searchTextValue => {

      if (searchTextValue) {
        this.searchItem(searchTextValue);
      } else {
        this.level = ViewLevel.master;
        this.reinitGraphs();
      }
    });

    if (this.router.url.replace('/', '') === 'statistics') {
      return this.isPageStatistics = true;
    }

    this.adminApi.getOutputNKPLogsDirFiles().subscribe(response => {
      this.logfiles = [];
      response.files.forEach(file => {
        this.logfiles.push(file);
      });
    }, error => {
      console.log(error);
    })
  }

  modifiedLogFile(logfile) {

    if (logfile.lastModifiedTime) {

      const date = moment(logfile.lastModifiedTime);
      const formattedDateTime = date.format('DD/MM/YYYY HH:mm:ss');
      return formattedDateTime;

    } else return 'none';
  }

  download(logfile) {

    this.adminApi.getOutputNKPLogsFile(logfile.name).subscribe(response => {
      let downloadlink = this.adminApi.getOutputDownloadLinks(response.downloadlink);
      this.downloadService.downloadFile(downloadlink, logfile.name);
    }, error => {
      console.log(error);
    })
  }

  onIdentKeyUp(target) {
    this.subject.next(target.value);
  }

  clearIdentifier(target) {
    this.identifier = null;
    this.subject.next(target.value);
  }

  getUserClientUrl() {
    return this.appSettings.userClientBaseUrl;
  }

  getCoreUrl() {
    return this.appSettings.coreBaseUrl;
  }

  getLastCommitHash() {
    const info = gitInfo;
    const hash = info.hash ? info.hash
      : info['default'].hash.substring(1);
    return hash;
  }

  changeEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    console.log("Changing event");
    this.reinitGraphs();
  }

  csvDetail() { 
    let url = this.adminApi.statisticsPidsCSVURL( `pids_${this.deatilTypes}`,
      this.dateFrom != null ? this.dateFrom.toISOString() : null,
      this.dateTo != null ? this.dateTo.toISOString() : null,
      this.identifier, this.filters, [`pids_${this.deatilTypes}`],
      // fmt parameters 
      ['Count',`${this.deatilTypes}`,'Title','Url'],null, `${this.deatilTypes}`,`${this.deatilTypes}.csv`
    );
    this.document.location.href = this.appSettings.adminApiBaseUrl +'/'+ url;
  }

  csvCollections() {
    let url = this.adminApi.statisticsPidsCSVURL( "pids_collection",
      this.dateFrom != null ? this.dateFrom.toISOString() : null,
      this.dateTo != null ? this.dateTo.toISOString() : null,
      this.identifier, this.filters, ['pids_collection'],
      // fmt parameters 
      ['Count','Collection','Title','Url'],null, "Collections","collection.csv"
    );
    this.document.location.href = this.appSettings.adminApiBaseUrl +'/'+ url;
  }

  csvModels() {
    let url = this.adminApi.statisticsFacetsCSVURL( "all_models",
    this.dateFrom != null ? this.dateFrom.toISOString() : null,
    this.dateTo != null ? this.dateTo.toISOString() : null,
    this.identifier, this.filters, ['provided_by_license', 'authors', 'langs', 'all_models'],
    // fmt parameters 
    /* header */
    ['Count','Model'], this.topLevelModels, "Models csv","models.csv"
  );
    this.document.location.href = this.appSettings.adminApiBaseUrl +'/'+ url;
  }

  csvAuthor() {
    let url = this.adminApi.statisticsFacetsCSVURL( "authors",
    this.dateFrom != null ? this.dateFrom.toISOString() : null,
    this.dateTo != null ? this.dateTo.toISOString() : null,
    this.identifier, this.filters, ['provided_by_license', 'authors', 'langs', 'all_models'],
    // fmt parameters - allowed values
    ['Count','Authors'],  null, "Authors csv","authors.csv"
  );
    this.document.location.href = this.appSettings.adminApiBaseUrl +'/'+ url;
      //this.goto(this.appSettings.adminApiBaseUrl +'/'+ url);
  }

  csvLang() {
      let url = this.adminApi.statisticsFacetsCSVURL( "langs",
      this.dateFrom != null ? this.dateFrom.toISOString() : null,
      this.dateTo != null ? this.dateTo.toISOString() : null,
      this.identifier, this.filters, ['provided_by_license', 'authors', 'langs', 'all_models'],
      ['Count','Lang'],null, "Lang csv","langs.csv"
    );
    this.document.location.href = this.appSettings.adminApiBaseUrl +'/'+ url;
  }


  csvLicenses() {
    let url = this.adminApi.statisticsFacetsCSVURL( "provided_by_license",
      this.dateFrom != null ? this.dateFrom.toISOString() : null,
      this.dateTo != null ? this.dateTo.toISOString() : null,
      this.identifier, this.filters, ['provided_by_license', 'authors', 'langs', 'all_models'],
      // fmt parameters
      ['Count','License'], null,"Licenses csv","licenses.csv"
    );
      this.document.location.href = this.appSettings.adminApiBaseUrl +'/'+ url;
  }
  


  anualYearOptions(): number[] {
    const currentYear = new Date().getFullYear();
    const lastThreeYears = [];
    for (let i = 0; i < 3; i++) {
      lastThreeYears.push(currentYear - i);
    }
    return lastThreeYears;
  }

  csvAnual(year:string) {
    //# Roční výkaz, 2019, akce: ALL, viditelnosti: ALL, unikátní IP adresy: false.
    let url = this.adminApi.statisticsAnulalCSVURL( year, [], `Roční výkaz, ${year}`,`anual-${year}.csv`);
    this.document.location.href = this.appSettings.adminApiBaseUrl +'/'+ url;
  }



  changeView(view: string) {
    this.view = view;
    this.local.setStringProperty('statistics.view', view);
    this.router.navigate(['/statistics/', view]);
  }

  getIndexTitle(doc:any) {
    let model = doc['model'];
    if (this.topLevelModels.indexOf(model) >= 0) {
      return doc['root.title']
    } else {
      if (doc['date.str'] && doc['title.search']) {
        let title = `${doc['root.title']} / ${doc['date.str']} - ${doc['title.search']}`
        return title;
      } else if (doc['date.str']){

        let title = `${doc['root.title']} / ${doc['date.str']}`
        return title;

      } else if (doc['part.number.str']){
        let title = `${doc['root.title']} / ${doc['part.number.str']}`
        return title;
      } else if (doc['title.search']){
        let title = `${doc['root.title']} / ${doc['title.search']}`
        return title;
      } else {
        return JSON.stringify(doc);
      }
    }

  }

  getDetailTitle(): string {
    return this.getIndexTitle(this.detailDoc);
    /*
    let model = this.detailDoc['model'];
    if (this.topLevelModels.indexOf(model) >= 0) {
      return this.detailDoc['root.title']
    } else {
      if (this.detailDoc['date.str'] && this.detailDoc['title.search']) {
        let title = `${this.detailDoc['root.title']}/${this.detailDoc['date.str']} - ${this.detailDoc['title.search']}`
        return title;
      } else if (this.detailDoc['part.number.str']){
        let title = `${this.detailDoc['root.title']}/${this.detailDoc['part.number.str']}`
        return title;
      } else if (this.detailDoc['title.search']){
        let title = `${this.detailDoc['root.title']}/${this.detailDoc['title.search']}`
        return title;
      } else {
        return JSON.stringify(this.detailDoc);
      }
    }*/
  }


 
  searchItem(id: string) {
    this.identifier = id;

    let params: HttpParams = new HttpParams();
    params = params.set('q', `pid:"${this.identifier}" OR id_ccnb:"${this.identifier}" OR id_isbn:"${this.identifier}" OR id_issn:"${this.identifier}"`);
    params = params.set('rows', '100');
    params = params.set('fl', 'pid title.search date.str model root.pid root.title part.number.str');

    this.clientApi.search(params).subscribe(docs => {
      if (docs.length == 1) {
        let model = docs[0]['model']
        // pouze pro modely monograph a periodical jdeme niz
        if (model.startsWith("monograph") || model.startsWith("periodical")) {
          this.level = ViewLevel.detail;
        } else {
          this.level = ViewLevel.master;
        }
        this.detailDoc = docs[0];
        //this.loadMods(docs[0]['pid']);
      }
      this.reinitGraphs();
   
        if (this.scrollelm) {
          let native = this.scrollelm.nativeElement;
          this.scrollelm.nativeElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start' // 'start' posune na začátek elementu, 'center' nebo 'end' jsou také možnosti
          });
        }
    });
  }

  showMore(id: string) {
    if (this.selection[id]) {
      this.selection[id] = !this.selection[id];
    } else {
      this.selection[id] = true;
    }

    if (this.selection[id]) {
      this.loadMods(id);
    }

  }


  /** Mods author  */
  getModsAuthor(pid:string) {
    return this.descriptions[pid]['author'];
  }

  isModsAuthor(pid:string) {
    return this.descriptions[pid] && this.descriptions[pid]['author'];
  }

  /** Publisher */
  getModsPublisher(pid:string) {
    return this.descriptions[pid]['origininfo_publisher'];
  }

  isModsPublisher(pid:string) {
    return this.descriptions[pid] && this.descriptions[pid]['origininfo_publisher'];
  }

  /** Mods keywords */
  getModsKeywords(pid:string) {
    return this.descriptions[pid]['keywords'];
  }

  isModsKeywords(pid:string) {
    return this.descriptions[pid] && this.descriptions[pid]['keywords'] && this.descriptions[pid]['keywords'].length > 0
  }

  /** Mods langs */
  getModsLangs(pid:string) {
    return this.descriptions[pid]['langs'];
  }

  isModsLangs(pid:string) {
    return this.descriptions[pid] && this.descriptions[pid]['langs'] && this.descriptions[pid]['langs'].length > 0;
  }


  /** Mods location  */
  getModsLocation(pid:string) {
    let location =  this.descriptions[pid]['location'];
    return location;
  }

  isModsLocation(pid:string) {
    return this.descriptions[pid] && this.descriptions[pid]['location'] && this.descriptions[pid]['location'].length>0
  }

  /** Mods physical location */
  getModsPhysicalLocation(pid:string) {
    let desc = this.descriptions[pid]['physicalDescription']
    return desc;
  }

  isModsPhysicalLocation(pid:string) {
    return this.descriptions[pid] && this.descriptions[pid]['physicalDescription']
  }

  getModsAbstract(pid:string) {
    return this.descriptions[pid]['abstract'];
  }

  isModsAbstract(pid:string) {
    return this.descriptions[pid] && this.descriptions[pid]['abstract']
  }

  getModsNote(pid:string) {
    return this.descriptions[pid]['note']    
  }

  isModsNote(pid:string) {
    return this.descriptions[pid] && this.descriptions[pid]['note']    
  }

  getModsISBN(pid:string) {
    return this.descriptions[pid]['isbn']
  }

  isModsISBN(pid:string) {
    return this.descriptions[pid] && this.descriptions[pid]['isbn']
  }

  getModsISSN(pid:string) {
    return this.descriptions[pid]['issn']
  }

  isModsISSN(pid:string) {
    return this.descriptions[pid] && this.descriptions[pid]['issn']
  }

  getModsBarCode(pid:string) {
    return this.descriptions[pid]['barcode']
  }

  isModsBarCode(pid:string) {
    return this.descriptions[pid] && this.descriptions[pid]['barcode'];
  }



  /** Mods - volume date */
  getModsvolumeDate(pid:string) {
    return this.descriptions[pid]['origininfo_dateissued'];
  }

  isModsVolumeDate(pid:string) {
    return this.descriptions[pid] && this.descriptions[pid]['origininfo_dateissued'];
  }


  /** Mods - volume number */
  getModsVolumeNumber(pid:string) {
   return this.descriptions[pid]['title_partNumber'];
  }

  isModsVolumeNumber(pid:string) {
   return this.descriptions[pid] && this.descriptions[pid]['title_partNumber'];
  }

  getModsTitle(pid:string) {
    return this.descriptions[pid]['title'];
  }

  isModsTitle(pid:string) {
    return this.descriptions[pid] && this.descriptions[pid]['title'];
  }

  getModsSubTitle(pid:string) {
    return this.descriptions[pid]['subTitle'];
  }

  isModsSubTitle(pid:string) {
    return this.descriptions[pid] && this.descriptions[pid]['subTitle'];
  }


  //descriptions[v.pid] && descriptions[v.pid]['isbn']

  loadMods(id: string) {
    if (id) {
      this.clientApi.getModsNewApi(id).subscribe(mr => {
        let modsFields = {};
        let ast = parse(mr);
        let mods = ast.root.children[0];

        //   title info 
        let titleInfo = this.elms(mods, 'titleInfo', null, null);
        if (titleInfo) {

            let titlePartNumber = titleInfo.map(element => {
            let partNumber = this.elms(element, 'partNumber', null, null);
            let f = this.texts(partNumber);
            return f ? f : '';
          }).join(', ');
          modsFields['title_partNumber'] = titlePartNumber;

          let title = titleInfo.map(element => {
            let partNumber = this.elms(element, 'title', null, null);
            let f = this.texts(partNumber);
            return f ? f : '';
          }).join(', ');
          modsFields['title'] = title;

          let subTitle = titleInfo.map(element => {
            let partNumber = this.elms(element, 'subTitle', null, null);
            let f = this.texts(partNumber);
            return f ? f : '';
          }).join(', ');
          modsFields['subTitle'] = subTitle;
        }

        // author
        let personal = this.elms(mods, 'name', 'type', null);
        if (personal) {
          let author = personal.map(element => {
            let nameParts = this.elms(element, 'namePart', null, null);
            nameParts = nameParts.filter((p) => {
              return (!p.attributes['type']) || (p.attributes['type'] && p.attributes['type'] !== 'date')
            });
            let f = this.texts(nameParts);
            return f ? f : '';
          }).join(', ');

          modsFields['author'] = author;
        }

        //   nakladatelske udaje
        let originInfo = this.elms(mods, 'originInfo', null, null);
        if (originInfo) {

          let oinfo = originInfo.map(element => {
            let nameParts = this.elms(element, 'publisher', null, null);
            let f = this.texts(nameParts);
            return f ? f : '';
          }).join(', ');

          modsFields['origininfo_publisher'] = oinfo;

          let dateIssued = originInfo.map(element => {
            let dateIssuedElms = this.elms(element, 'dateIssued', null, null);
            // dateIssuedElms = dateIssuedElms.filter((p) => { 
            //   let retval = Object.keys(p.attributes).length == 0;
            //   return retval;
            // });

            let f = this.texts(dateIssuedElms);
            return f ? f : '';
          }).join(', ');

          modsFields['origininfo_dateissued'] = dateIssued;

        }

        //abstract
        let abstract = this.elms(mods, 'abstract', null, null);
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
        let langs = this.elms(mods, 'language', null, null);
        if (langs) {
          let tl = langs.map(element => {
            let term = this.elms(element, 'languageTerm', 'authority', 'iso639-2b');
            let f = this.texts(term);
            return f ? f : '';
          });
          modsFields['langs'] = tl;
        }

        // subject - klicova slova
        let keywords = this.elms(mods, 'subject', null, null);
        if (keywords) {
          let tl = keywords.map(element => {
            let term = this.elms(element, 'topic', null, null);
            let f = this.texts(term);
            return f ? f : '';
          });
          let filtered = [];
          tl.forEach(k => {
            if (k !== '' && !filtered.includes(k)) {
              filtered.push(k);
            }
          });
          modsFields['keywords'] = filtered;
        }

        // location 
        let location = this.elms(mods, 'location', null, null);
        if (location) {
          let tl = location.map(element => {
            let term = this.elms(element, 'physicalLocation', null, null);
            let f = this.texts(term);
            return f ? f : '';
          });
          modsFields['location'] = tl;
        }

        //physicalDescription
        let physicalDescription = this.elms(mods, 'physicalDescription', null, null);
        if (physicalDescription) {
          let desc = '';
          let tl = physicalDescription.forEach(element => {
            let ext = this.elms(element, 'extent', null, null);
            if (ext) {
              let tt = this.texts(ext);
              desc = 'Rozsah:' + this.texts(ext);
            }
          });
          modsFields['physicalDescription'] = desc;
        }
        this.descriptions[id] = modsFields;
      });
    }

  }

  /** Utilitni metody ??  Presunout ?? */

  // // date formatting 
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
    let texts = elms.map(elm => {
      return elm.content;
    });
    return texts.join(' ');
  }

  private first(parent, name) {
    let first = parent.children.find((obj) => {
      return obj.name === name || obj.name.includes(':' + name);
    });
    return first;
  }

  private elms(parent, name, attrName, attrValue) {
    let elms = parent.children.filter((obj) => {
      return obj.name === name || obj.name.includes(':' + name);
    });
    if (attrName != null) {
      let tt = elms.filter((obj) => {
        if (attrValue != null) {
          return obj.attributes[attrName] === attrValue;
        } else {
          return attrName in obj.attributes;
        }
      });
      return tt;
    } else return elms;
  }

  allowedGlobalAction(name: string) {
    if (this.auth.authorizedGlobalActions) {
      let retval = this.auth.authorizedGlobalActions.indexOf(name) >= 0;
      return retval;
    } else return false;
  }

  openNkpLogyDialog() {
    const dialogRef = this.dialog.open(GenerateNkpLogsDialogComponent, {
      width: '600px',
      panelClass: 'app-generate-nkp-logs-dialog'
    });
  }

  openDeleteStatisticsDialog() {
    const dialogRef = this.dialog.open(DeleteStatisticsDialogComponent, {
      width: '600px',
      panelClass: 'app-delete-statistics-dialog'
    });
  }

  toggleFilter(filter: any): void {
    const index = this.filters.findIndex(f => f.name === filter.name && f.value === filter.value);
    let hashVal = `${filter.data.filterField}_${filter.data.filterValue}`;
    if (filter.modifier) {
      hashVal = hashVal + "-" + filter.modifier;
    }
    if (index >= 0) {
      this.rememberColor.delete(hashVal);
      this.filters.splice(index, 1);
    } else {
      if (filter.color) {
        this.rememberColor.set(hashVal, filter.color);
      }
      this.filters.push(filter);
    }
    this.reinitGraphs();
  }
}

/* 
periodikum: #167a1b
monograph: #c73565
*/