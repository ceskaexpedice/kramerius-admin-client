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
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import { GenerateNkpLogsDialogComponent } from 'src/app/dialogs/generate-nkp-logs-dialog/generate-nkp-logs-dialog.component';
import { DeleteStatisticsDialogComponent } from 'src/app/dialogs/delete-statistics-dialog/delete-statistics-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { FileDownloadService } from 'src/app/services/file-download';
import * as moment from 'moment';
import { IsoConvertService } from 'src/app/services/isoconvert.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {

  // vybrane modely
  models = ["monograph", "periodical", "soundrecording","map","collection","manuscript","graphic","archive","convolute","museumExhibit"];


  // konfigurace grafu 
  modelsOpts: EChartsOption = {};
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
  descriptions: any = {};

  view: string;
  path: string;

  lang: string;

  public selection: any = [];

  public isResultModel: boolean = false;
  public isResultLang: boolean = false;
  public isResultAuthor: boolean = false;
  public isProvidedByLicense: boolean = false;
  public isCollections: boolean = false;



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


      this.adminApi.statisticsFacets(
        this.dateFrom != null ? this.format(this.dateFrom) : null,
        this.dateTo != null ? this.format(this.dateTo) : null,
        this.identifier, this.filters, [ 'provided_by_license', 'authors', 'langs', 'all_models']).subscribe(response => {
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
  
            // models
            let models = response['facet_counts']['facet_fields']['all_models'];
            let modelCounts = this.extractCounts(models);
            let modelNames = this.extractNames(models);
            this.reinitModelGraph(modelNames, modelCounts);
  
            // providedByLicenses
            let providedByLicenses = response['facet_counts']['facet_fields']['provided_by_license'];
            let providedLicensesCounts = this.extractCounts(providedByLicenses);
            let providedLicensesNames = this.extractNames(providedByLicenses);
            this.reinitProvidedLicensesGraph(providedLicensesNames, providedLicensesCounts);
  
            // check if pids_collection exists
            this.adminApi.statisticsFacets(
              null,
              null,
              null, [{
                data:{
                  filterField: "pids_collection",
                  filterValue: "*"
                }
              }],[]).subscribe(response => {

                let pidModels = modelNames.slice().filter(item => this.models.includes(item)).map(item => `pids_${item}`);
                if (response['response']['numFound'] && response['response']['numFound'] > 0) {
                  pidModels.push("pids_collection");
                }

                this.adminApi.statisticsFacets(
                  this.dateFrom != null ? this.format(this.dateFrom) : null,
                  this.dateTo != null ? this.format(this.dateTo) : null,
                  this.identifier, this.filters, pidModels).subscribe(response => {

                    // collections
                    let collections = response['facet_counts']['facet_fields']['pids_collection'];
                    let collectionCounts = this.extractCounts(collections);
                    let collectionPids = this.extractNames(collections);
                    this.reinitCollectionsGraph(collectionPids, collectionCounts);

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
    this.table = new Map<string, any>();
    for (let i = 0; i < this.models.length; i++) {
      let tableFacets = response['facet_counts']['facet_fields'][`pids_${this.models[i]}`];
      if (tableFacets) {
        let values = [];
        let tablePids = this.extractNames(tableFacets);
        let tableCounts = this.extractCounts(tableFacets);
        let map: Map<string, number> = new Map();
        for (let j = 0; j < tablePids.length; j++) { map.set(tablePids[j], tableCounts[j]); }
        this.clientApi.getPids(tablePids, ['pid', 'title.search']).subscribe(resp => {
          console.log(resp);
          for (let k = 0; k < resp.length; k++) {
            let count = map.get(resp[k].pid);
            if (count > 0) {
              let val = {
                count: map.get(resp[k].pid),
                pid: resp[k].pid,
                title: resp[k]['title.search']
              };
              values.push(val);
            }
          }
          if (values.length > 0) {
            this.table.set(this.models[i], values);
          }
        });

      }
    }
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
        collectionItems.push({
          value: collectionCounts[i],
          name: collectionTitle,
          filterField: "pids_collection",
          filterValue: col['pid']
        });
      }

      this.isCollections = collectionItems.length > 0;

      this.collectionsOpts = {
        legend: {
          type: "scroll"
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
      providedLicensesItems.push(obj);

    }

    this.isProvidedByLicense = providedLicensesItems.length > 0;
    this.providedByLicensesOpts = {
      legend: {
        type: "scroll"
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

  private reinitModelGraph(modelNames: string[], modelCounts: number[]) {
    let modelItems = [];
    for (let i = 0; i < modelNames.length; i++) {
      if (this.models.indexOf(modelNames[i]) >= 0) {

        modelItems.push({
          value: modelCounts[i],
          name: modelNames[i],
          filterField: "all_models",
          filterValue: modelNames[i]
        });
      }
    }
    this.isResultModel = modelItems.length > 0;
    this.modelsOpts = {
      legend: {
        type: "scroll"
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
        data: modelItems
      }
    };
  }

  private reinitLangGraph(langsNames: string[], langsCount: number[], langs: any) {
    let langsItems = [];
    for (let i = 0; i < langsNames.length; i++) {
      langsItems.push({
        value: langsCount[i],
        name: langsNames[i],
        filterField: "langs",
        filterValue: langsNames[i]
      });
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
          type: 'bar'
        }
      ]
    };
  }

  /** Author graph */
  private reinitAuthorGraph(authorNames: string[], authorCounts: number[], authors: any) {
    let authorItems = [];
    for (let i = 0; i < authorNames.length; i++) {
      authorItems.push({
        value: authorCounts[i],
        name: authorNames[i],
        filterField: "authors",
        filterValue: authorNames[i]
      });
    }
    this.isResultAuthor = authorItems.length > 0;
    this.authorOpts = {
      xAxis: {
        type: 'category',
        data: this.extractNames(authors)
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
    //this.view = this.local.getStringProperty('statistics.view', 'graphs');
    this.view = this.router.url.replace('/statistics/', '');
    this.lang = this.appSettings.defaultLang;
    this.reinitGraphs();
    this.subject.pipe(
      debounceTime(400)
    ).subscribe(searchTextValue => {
      this.reinitGraphs();
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


  csvModels() {
    let url = this.appSettings.adminApiBaseUrl + '/statistics/summary';
    this.goto(url);

  }
  csvAuthor() {
    let url = this.appSettings.adminApiBaseUrl + '/statistics/author';
    this.goto(url);

  }
  csvLang() {
    let url = this.appSettings.adminApiBaseUrl + '/statistics/lang';
    this.goto(url);
  }

  goto(url: string) {
    let u = url + "/export/csv";
    if (this.dateFrom || this.dateTo || this.license) {
      u = u + "?";
    }
    if (this.dateFrom) {
      let fdat = this.format(this.dateFrom);

      u = u + "dateFrom=" + (u.endsWith("?") ? fdat : fdat);
    }
    if (this.dateTo) {
      let fdat = this.format(this.dateTo);
      u = u + (u.endsWith("?") ? "" : "&") + "dateTo=" + fdat;
    }
    if (this.license && this.license !== 'All') {
      u = u + (u.endsWith("?") ? "" : "&") + "license=" + this.license;
    }
    console.log("url is " + url);
    this.document.location.href = u;
  }


  changeView(view: string) {
    this.view = view;
    this.local.setStringProperty('statistics.view', view);
    this.router.navigate(['/statistics/', view]);
  }

  showMore(id: string) {
    if (this.selection[id]) {
      this.selection[id] = !this.selection[id];
    } else {
      this.selection[id] = true;
    }

    if (this.selection[id]) {
      this.clientApi.getModsNewApi(id).subscribe(mr => {
        let modsFields = {};
        let ast = parse(mr);
        let mods = ast.root.children[0];

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

          modsFields['origininfo'] = oinfo;
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
    if (index >= 0) {
      this.filters.splice(index, 1);
    } else {
      this.filters.push(filter);
    }
    this.reinitGraphs();
  }
}
