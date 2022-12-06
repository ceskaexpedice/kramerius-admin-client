import { HttpClient } from '@angular/common/http';
import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';

declare var APP_GLOBAL: any;

@Injectable()
export class AppSettings {

  // external properties from /assets/shared/globals.js
  userClientBaseUrl = APP_GLOBAL.userClientBaseUrl;
  deployPath = APP_GLOBAL.deployPath || '';
  coreBaseUrl = APP_GLOBAL.coreBaseUrl;
  keycloak = APP_GLOBAL.keycloak;

  devMode = !!APP_GLOBAL.devMode; //pokud true, tak se zobrazuje zalozka DEV a dalsi testovaci veci (napr. spousteni testovaciho procesu)
  version = "1.3.0" + (this.devMode ? "-dev" : "");

  clientApiBaseUrl = this.coreBaseUrl + '/api/client/v7.0';
  adminApiBaseUrl = this.coreBaseUrl + '/api/admin/v7.0';

  //cdkApiBaseUrl = APP_GLOBAL.cdkApiBaseUrl || 'http://localhost:8080/search';
  cdkApiBaseUrl = APP_GLOBAL.cdkApiBaseUrl || 'http://10.1.0.176:8080/search'; // docasne

  //cdkApiBaseUrl = APP_GLOBAL.cdkApiBaseUrl || 'https://cdk-client-devel.k7-test.mzk.cz/search'; 

  defaultLang = APP_GLOBAL.lang || 'cs';

  homeDashboard = APP_GLOBAL.homeDashboard || [];
  cdkMode = !!APP_GLOBAL.cdkMode;


  interceptresponse: EventEmitter<any> = new EventEmitter<any>();

  constructor(private http: HttpClient) {
  }


  getCoreInfo(): Observable<any> {
      return this.http.get(`${this.clientApiBaseUrl}/info`).pipe();
  }


}
