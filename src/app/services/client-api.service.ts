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

  getThumb(uuid: string): string {
    return this.baseUrl + `/items/${uuid}/image/thumb`;
  }

  search(params): Observable<any[]> {
    return this.get('/search', params).pipe(map(response => response['response']['docs']));
  }

  getCollectionChildren(uuid: string): Observable<any[]> {
    return this.search({
      q: `in_collections.direct:"${uuid}"`,
      fl: 'model,pid,title.search,root.title,date.str,level',
      sort: 'rels_ext_index.sort asc',
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

  getObjectsByModelFromIndex(model: string) {
    return this.search({
      q: `model:${model}`,
      fl: 'pid', //'pid,title.search',
      rows: '2147483647'
    }).pipe(
      map(items => items.map(item => item['pid']))
    );
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

}
