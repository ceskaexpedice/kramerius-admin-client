import { Injectable } from '@angular/core';

@Injectable()
export class AppSettings {

  devMode = true; //pokud true, tak se zobrazuje zalozka Test a dalsi testovaci veci (napr. spousteni testovaciho procesu)
  version = "1.0" + (this.devMode ? "-dev" : "");

  //kramerius.dev.digitallibrary.cz
  //clientApiBaseUrl = 'https://kramerius.dev.digitallibrary.cz/search/api/client/v6.0';
  //adminApiBaseUrl = 'https://kramerius.dev.digitallibrary.cz/search/api/admin/v1.0';
  //digitalLibraryBaseUrl = 'https://dev.digitallibrary.cz/d/'; 

  //k7-test.mzk.cz
  //clientApiBaseUrl = 'http://k7-test.mzk.cz/search/api/client/v6.0';
  //adminApiBaseUrl = 'http://k7-test.mzk.cz/search/api/admin/v1.0';
  //digitalLibraryBaseUrl = 'https://k7-test.mzk.cz/';

  //localhost
  clientApiBaseUrl = 'http://localhost:8080/search/api/client/v6.0';
  adminApiBaseUrl = 'http://localhost:8080/search/api/admin/v1.0';
  digitalLibraryBaseUrl = 'http://www.digitalniknihovna.cz/mzk'; //TODO

  constructor() {
  }

} 
