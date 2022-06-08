import { Injectable } from '@angular/core';

declare var APP_GLOBAL: any;

@Injectable()
export class AppSettings {

  // external properties from /assets/shared/globals.js
  userClientBaseUrl = APP_GLOBAL.userClientBaseUrl;
  deployPath = APP_GLOBAL.deployPath || '';
  coreBaseUrl = APP_GLOBAL.coreBaseUrl;
  keycloak = APP_GLOBAL.keycloak;

  devMode = !!APP_GLOBAL.devMode; //pokud true, tak se zobrazuje zalozka DEV a dalsi testovaci veci (napr. spousteni testovaciho procesu)
  version = "1.1.6" + (this.devMode ? "-dev" : "");

  clientApiBaseUrl = this.coreBaseUrl + '/api/client/v7.0';
  adminApiBaseUrl = this.coreBaseUrl + '/api/admin/v7.0';

  defaultLang = APP_GLOBAL.lang || 'cs';

  constructor() {
  }

}
