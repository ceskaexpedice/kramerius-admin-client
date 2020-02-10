import { Injectable } from '@angular/core';

@Injectable()
export class AppSettings {

  adminApiBase = 'https://kramerius.dev.digitallibrary.cz/search/api/v6.0';
  //adminApiBase = 'http://localhost:8080/search/api/v6.0';

  constructor() {
  }

}
