import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from './app-settings';
import { map, tap } from 'rxjs/operators';
import { isNgTemplate } from '@angular/compiler';

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

  getMods(uuid: string): Observable<string> {
    return this.getText(`/items/${uuid}/streams/BIBLIO_MODS`);
  }

  search(params): Observable<any[]> {
    return this.get('/search', params).pipe(map(response => response['response']['docs']));
  }

  getCollectionChildren(uuid: string): Observable<any[]> {
    return this.search({
      q: `in_collections.direct:"${uuid}"`,
      fl: 'model,pid,title.search,root.title',
      ows: '400'
    });
  }

  getAvailableCollections(uuid: string): Observable<any[]> {
    return this.search({
      q: `model:collection !in_collections:"${uuid}" AND !pid:"${uuid}"`,
      fl: 'pid,title.search',
      rows: '400'
    });
  }

  getObjectsByModelFromIndex(model: string) {
    return this.search({
      q: `model:${model}`,
      fl: 'pid', //'pid,title.search',
      rows: '2147483647'
    }).pipe(
      map(items  => items.map(item => item['pid']))
    );
  }

}
