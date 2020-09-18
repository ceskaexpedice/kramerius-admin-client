import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppSettings } from './app-settings';
import { map, tap } from 'rxjs/operators';

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
      q: `n.in_collections.direct:"${uuid}"`,
      fl: 'n.model,n.pid,n.title.search'
    });
  }

  getAvailableCollections(uuid: string): Observable<any[]> {
    return this.search({
      q: `n.model:collection !n.in_collections:"${uuid}" AND !n.pid:"${uuid}"`,
      fl: 'n.pid,n.title.search'
    });
  }

}
