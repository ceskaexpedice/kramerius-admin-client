import { Injectable } from '@angular/core';

declare var APP_GLOBAL: any;

@Injectable()
export class AppSettings {

  // external properties from /assets/shared/globals.js
  public userClientBaseUrl = APP_GLOBAL.userClientBaseUrl;
  public coreBaseUrl = APP_GLOBAL.coreBaseUrl;
  public keycloakUrl = APP_GLOBAL.keycloakUrl;
  //

  devMode = false; //pokud true, tak se zobrazuje zalozka Test a dalsi testovaci veci (napr. spousteni testovaciho procesu)
  version = "1.0.25" + (this.devMode ? "-dev" : "");

  clientApiBaseUrl = this.coreBaseUrl + 'api/client/v7.0';
  adminApiBaseUrl = this.coreBaseUrl + 'api/admin/v7.0';

  constructor() {
  }

}
