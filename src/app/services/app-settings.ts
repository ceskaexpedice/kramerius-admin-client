import { Injectable } from '@angular/core';

@Injectable()
export class AppSettings {

  devMode = false; //pokud true, tak se zobrazuje zalozka Test a dalsi testovaci veci (napr. spousteni testovaciho procesu)
  version = "1.18" + (this.devMode ? "-dev" : "");

  //kramerius.dev.digitallibrary.cz
  //digitalLibraryBaseUrl = 'https://dev.digitallibrary.cz/d';
  //coreBaseUrl = 'https://kramerius.dev.digitallibrary.cz/search/'

  //k7-test.mzk.cz
  digitalLibraryBaseUrl = 'https://k7-test.mzk.cz/mzkk7';
  coreBaseUrl = 'https://k7-test.mzk.cz/search/'

  //localhost
  // digitalLibraryBaseUrl = 'http://www.digitalniknihovna.cz/mzk'; //TODO
  // coreBaseUrl = 'http://localhost:8080/search/'


  clientApiBaseUrl = this.coreBaseUrl + 'api/client/v6.0';
  adminApiBaseUrl = this.coreBaseUrl + 'api/admin/v1.0';

  constructor() {
  }

}
