import { Injectable } from '@angular/core';

@Injectable()
export class AppSettings {

  devMode = true; //pokud true, tak se zobrazuje zalozka Test a dalsi testovaci veci (napr. spousteni testovaciho procesu)

  clientApiBaseUrl = 'https://kramerius.dev.digitallibrary.cz/search/api/client/v6.0';
  adminApiBaseUrl = 'https://kramerius.dev.digitallibrary.cz/search/api/admin/v1.0';
  //clientApiBaseUrl = 'http://localhost:8080/search/api/client/v6.0';
  //adminApiBaseUrl = 'http://localhost:8080/search/api/admin/v1.0';

  constructor() {
  }

}
