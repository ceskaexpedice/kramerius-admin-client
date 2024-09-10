import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from './app-settings';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClientApiService {

  private baseUrl: string;

  constructor(private http: HttpClient, private appSettings: AppSettings) {
    this.baseUrl = this.appSettings.clientApiBaseUrl;
  }

  private doGet(path: string, params, type = 'json'): Observable<Object> {
    const options = {
      params: params
    };
    if (type === 'text') {
      options['responseType'] = 'text';
      options['observe'] = 'response';
    }
    let url = this.baseUrl + path;
    return this.http.get(url, options);
  }

  private get(path: string, params = {}): Observable<Object> {
    return this.doGet(path, params);
  }

  private getText(path: string, params = {}): Observable<string> {
    return this.doGet(path, params, 'text').pipe(map(response => response['body']));
  }

  getGeneralQuery(query: string): Observable<string> {
    return this.getText(query);
  }


  getMods(uuid: string): Observable<string> {
    return this.getText(`/items/${uuid}/streams/BIBLIO_MODS`);
  }

  getModsNewApi(uuid: string): Observable<string> {
    return this.getText(`/items/${uuid}/metadata/mods`);
  }

  getThumb(uuid: string): string {
    return this.baseUrl + `/items/${uuid}/image/thumb`;
  }

  search(params): Observable<any[]> {
    return this.get('/search', params).pipe(map(response => response['response']['docs']));
  }

  /** facets from search index */
  facets(params): Observable<any[]> {
    return this.get('/search', params).pipe(map(response => response['facet_counts']['facet_fields']));
  }

  fullSearch(params): Observable<any[]> {
    return this.get('/search', params).pipe(map(response => response['response']));
  }


  getCollections(rows:number, offset:number, standalone:boolean, prefix:string, sort:string, sortDir: string) {

    let iSort = 'title.sort asc';
    if (sort && sortDir) {
      iSort = sort +' '+sortDir;
    }

    let filterQuery:string = 'model:"collection"';
    if (standalone) {
      filterQuery = filterQuery + ' AND collection.is_standalone:'+standalone
    }
    if (prefix) {
      // jedno slovo = prefix, dve a vice slov - nazev 
      let tokenized = prefix.match(/\b\w+\b/g);
      if (!tokenized || tokenized.length ==  1) {
        filterQuery = filterQuery +  ' AND title.search:'+prefix+"*";
      } else {

        let start = "{!";
        let end = "}";

        let edismax = '_query_:"'+start+'edismax qf=title.search'+end+prefix+'"';

        filterQuery = filterQuery +' AND ' + edismax;
      }
    }
    return this.fullSearch({
      q: filterQuery,
      //fq: filterQuery,
      fl: '*',
      sort: iSort,
      rows: rows,
      start: offset,
    });

  }

  getCollectionChildren(uuid: string): Observable<any[]> {
    //vrati ofilterQuerybsah sbirky na zaklade priznaku ve vyhledavacim indexu (tj. korektni az eventually po reindexaci)
    //takze hned po pridani (spatne) ne, hned po odbrani (spatne) ano
    return this.search({
      q: `in_collections.direct:"${uuid}"`,
      fl: 'model,pid,title.search,root.title,date.str,level,title.search_*',
      //sort: 'rels_ext_index.sort asc',
      rows: '400'
    });
  }

  getAvailableCollections(uuid: string): Observable<any[]> {
    return this.search({
      q: `model:collection !in_collections:"${uuid}" AND !pid:"${uuid}"`,
      fl: 'pid,title.search',
      rows: '400'
    });
  }

  getObjectByPidFromIndex(pid: string) {
    return this.search({
      q: 'pid:' + pid.replace(':', '\\:'),
    })
      .pipe(
        map(items => items[0])
      );
  }

  // getAllModelsFromProcessingIndex



  getAllModelsFromIndex(): Observable<any[]> {
    //http://localhost:8080/search/api/admin/v7.0/processing/models
    return this.facets({
      q: '*',
      fl: 'pid', //'pid,title.search',
      rows: '0',
      facet: 'true',
      'facet.field':'model'
    });
  }

  getObjectsByModelFromIndex(model: string) {
    return this.search({
      q: `model:${model}`,
      fl: 'pid', //'pid,title.search',
      rows: '2147483647'
    }).pipe(
      map(items => items.map(item => item['pid']))
    );
  }



  getPids(pids: string[], fieldlist:string[] ): Observable<any> {
    const pidQuery = pids.map(pid => `pid:"${pid}"`).join(' OR ');
    const fl = fieldlist ? fieldlist.map(fl => `${fl}`).join(','):"*";
    return this.search({
      q: pidQuery,
      fl: fl,
      rows: pids.length
    });
  }


  getIndexationInfoForPids(pids: string[]) {
    let query = "";
    pids.forEach(pid => {
      query += "pid:" + pid.replace(':', '\\:') + " OR ";
    });
    query = query.substring(0, query.length - " OR ".length);
    return this.search({
      q: query,
      fl: 'pid,indexer_version,full_indexation_in_progress',
      rows: pids.length
    });
  }

  getInfo(): Observable<any> {
    return this.get(`/info`);
  }


  getStructure(pid: string, params = {}):  Observable<any> {
    let path =  `/items/${pid}/info/structure`;
    return this.doGet(path, params);
  }

}
