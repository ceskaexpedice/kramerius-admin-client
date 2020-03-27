import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppSettings } from './app-settings';
import { map, tap } from 'rxjs/operators';
import { ModsParserService } from './mods-parser.service';

@Injectable({
  providedIn: 'root'
})
export class ClientApiService {

  private baseUrl: string;

  constructor(private http: HttpClient, private appSettings: AppSettings, private mods: ModsParserService) {
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
    //TODO: odstranit do produkce pouzivani /api/v5.0/item
    //url = url.replace(/api\/v6\.0\/item/, "api/v5.0/item");
    return this.http.get(url, options);
  }

  private get(path: string, params = {}): Observable<Object> {
    return this.doGet(path, params);
  }

  private getText(path: string, params = {}): Observable<string> {
    return this.doGet(path, params, 'text').pipe(map(response => response['body']));
  }

  getMods(uuid: string): Observable<string> {
    return this.getText(`/item/${uuid}/streams/BIBLIO_MODS`);
  }

  search(params) {
    return this.get('/search', params);
  }

}
