import { Injectable } from '@angular/core';

declare var APP_GLOBAL: any;

@Injectable()
export class AppSettings {

  // external properties from /assets/shared/globals.js
  public userClientBaseUrl = APP_GLOBAL.userClientBaseUrl;
  public coreBaseUrl = APP_GLOBAL.coreBaseUrl;
  public keycloak = APP_GLOBAL.keycloak;


  devMode = false; //pokud true, tak se zobrazuje zalozka DEV a dalsi testovaci veci (napr. spousteni testovaciho procesu)
  version = "1.1.3" + (this.devMode ? "-dev" : "");

  clientApiBaseUrl = this.coreBaseUrl + '/api/client/v7.0';
  adminApiBaseUrl = this.coreBaseUrl + '/api/admin/v7.0';

  constructor() {
  }

}
