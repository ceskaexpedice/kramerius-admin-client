import { HttpClient } from '@angular/common/http';
import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';

declare var APP_GLOBAL: any;

@Injectable()
export class AppSettings {
  static adminClientVersion = "1.4.8" + (!!APP_GLOBAL.devMode ? "-dev" : "");



  // external properties from /assets/shared/globals.js
  userClientBaseUrl = APP_GLOBAL.userClientBaseUrl;
  deployPath = APP_GLOBAL.deployPath || '';
  coreBaseUrl = APP_GLOBAL.coreBaseUrl;

  keycloak = APP_GLOBAL.keycloak;

  //webClient = APP_GLOBAL.webClient || 'https://ceskadigitalniknihovna.cz'

  devMode = !!APP_GLOBAL.devMode; //pokud true, tak se zobrazuje zalozka DEV a dalsi testovaci veci (napr. spousteni testovaciho procesu)

  clientApiBaseUrl = this.coreBaseUrl + '/api/client/v7.0';
  adminApiBaseUrl = this.coreBaseUrl + '/api/admin/v7.0';
  harvestAapiBaseURL = this.coreBaseUrl+'/api/harvest/v7.0';


  cdkApiBaseUrl = APP_GLOBAL.cdkApiBaseUrl ||  this.coreBaseUrl; 

  defaultLang = APP_GLOBAL.lang || 'cs';

  languages = APP_GLOBAL.languages || ['cs','en','de'];

  homeDashboard = APP_GLOBAL.homeDashboard || [];
  cdkMode = !!APP_GLOBAL.cdkMode;

  proarc = APP_GLOBAL.proarc || [];
  altoeditor = APP_GLOBAL.altoeditor || [];
  krameriusInstance = APP_GLOBAL.krameriusInstance || '';

  processRefreshInterval = APP_GLOBAL.processRefreshInterval || 5;


  interceptresponse: EventEmitter<any> = new EventEmitter<any>();

  constructor(private http: HttpClient) {
  }


  getCoreInfo(): Observable<any> {
    return this.http.get(`${this.clientApiBaseUrl}/info`).pipe();
  }
}
