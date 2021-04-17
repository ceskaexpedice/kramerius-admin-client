import { Injectable } from '@angular/core';

@Injectable()
export class AppSettings {

  devMode = false; //pokud true, tak se zobrazuje zalozka Test a dalsi testovaci veci (napr. spousteni testovaciho procesu)
  version = "1.13" + (this.devMode ? "-dev" : "");

  //kramerius.dev.digitallibrary.cz
  //digitalLibraryBaseUrl = 'https://dev.digitallibrary.cz/d/';
  //coreBaseUrl = 'https://kramerius.dev.digitallibrary.cz/search/'

  //k7-test.mzk.cz
  //digitalLibraryBaseUrl = 'https://k7-test.mzk.cz/';
  //coreBaseUrl = 'https://k7-test.mzk.cz/search/'

  //localhost
  digitalLibraryBaseUrl = 'http://www.digitalniknihovna.cz/mzk'; //TODO
  coreBaseUrl = 'http://localhost:8080/search/'


  clientApiBaseUrl = this.coreBaseUrl + 'api/client/v6.0';
  adminApiBaseUrl = this.coreBaseUrl + 'api/admin/v1.0';

  constructor() {
  }

  //curl 'http://localhost:8983/solr/search/select?q=pid%3Auuid%5C%3Ae7bee81f-c7d7-4a50-a522-243f38a214fc'

  //uuid:a100df56-a2b0-40cd-a54b-5f79f712e59d

  //curl 'http://localhost:8983/solr/processing/select?q=targetPid%3Auuid%5C%3aa100df56-a2b0-40cd-a54b-5f79f712e59d'

  //curl 'http://localhost:8983/solr/processing/select?q=source%3Auuid%5C%3aa100df56-a2b0-40cd-a54b-5f79f712e59d'

  //"ref":"file:c8/1b/74/info%3Afedora%2Fuuid%3Aa100df56-a2b0-40cd-a54b-5f79f712e59d",

  //3 sbirky v resource indexu 
  //curl 'http://localhost:8983/solr/processing/select?q=model%3Amodel%5C%3Acollection'

  //uuid:b8aec1f2-1439-4925-a174-e34ebbec1cfb

  //curl 'http://localhost:8983/solr/processing/select?q=targetPid%3Auuid%5C%3ab8aec1f2-1439-4925-a174-e34ebbec1cfb'
  //nic

  //uuid:e7bee81f-c7d7-4a50-a522-243f38a214fc
  //curl 'http://localhost:8983/solr/processing/select?q=targetPid%3Auuid%5C%3ae7bee81f-c7d7-4a50-a522-243f38a214fc'
  //nic

  
  //uuid:a100df56-a2b0-40cd-a54b-5f79f712e59d
  //curl 'http://localhost:8983/solr/processing/select?q=targetPid%3Auuid%5C%3aa100df56-a2b0-40cd-a54b-5f79f712e59d'
  //nic


  //~/solr/bin/post -c processing to_be_deleted_from_processing.xml.xml 

  //95dd7230-817a-46f6-bd9e-030412cd04d4
  //14dbe834-e2a3-42f5-8840-4d490bf28c04

  //e14252e3-d1ac-4387-a5ef-3ec9d38b6596

  //java.io.FileNotFoundException: /home/kramerius/akubra/objectStore/16/ea/d0/info%3Afedora%2Fuuid%3Ae14252e3-d1ac-4387-a5ef-3ec9d38b6596 (Permission denied)







} 
