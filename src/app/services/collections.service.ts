import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Collection } from '../models/collection.model';
import { ModsParserService } from './mods-parser.service';
import { ClientApiService } from './client-api.service';
import { AdminApiService } from './admin-api.service';

@Injectable({
  providedIn: 'root'
})
export class CollectionsService {

  constructor(private clientApi: ClientApiService, private adminApi: AdminApiService, private modsParser: ModsParserService) { }

  //TODO: mozna nepouzivat client search api, ale radsi admin collection api. Protoze nez se sbirka zaindexuje pro vyhledavani, muze to trvat i dny (podle poctu veci ve fronte)
  //zatimco pres api (Akubra, processing index) je zmena videt temer hned
  //a taky to tam logicky nepatri
  //takze by bylo v admin api GET /collections, coz by vracelo zaznam sbirky, pouze bez dlouhe popisu. A razeni podle casovych znamek a  filtrovani (jen samostatne) by si delal klient
  getCollections(offset: number, limit: number): Observable<[Collection[], number]> {
    const params = {
      q: 'n.model:collection',
      fl: 'n.pid,n.title.search,n.collection.desc,n.created,n.modified',
      rows: limit,
      start: offset
    };
    // return this.clientApi.search(params).pipe(
    //   map(response => [Collection.fromJsonArray(response['response']['docs']), parseInt(response['response']['numFound'], 10)]));
    
    //TODO: use offset, limit
    return this.adminApi.getCollections().pipe(
      map(response => {
        //console.log(response);
        return [Collection.fromAdminApiJsonArray(response['collections']), parseInt(response['total_size'], 10)]
      }));
  }

  getCollection(id: string): Observable<Collection> {
    return this.adminApi.getCollection(id).pipe(map(response => {
      //console.log(response);
      const col: Collection = {
        id: response['pid'],
        name: response['name'],
        description: response['description'],
        content: response['content'],
        createdAt: response['created'],
        modifiedAt: response['modified'],
      }
      return col;
    }));
  }

  createCollection(collection: Collection): Observable<Object> {
    return this.adminApi.createCollection(collection);
  }

  updateCollection(collection: Collection): Observable<Object> {
    return this.adminApi.updateCollection(collection);
  }

  deleteCollection(collection: Collection): Observable<Object> {
    return this.adminApi.deleteCollection(collection.id);
  }
}
