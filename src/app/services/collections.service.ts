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

  getCollections(offset: number, limit: number): Observable<[Collection[], number]> {
    const params = {
      q: 'n.model:collection',
      fl: 'n.pid,n.title.search,n.collection.desc,n.created,n.modified',
      rows: limit,
      start: offset
    };
    return this.clientApi.search(params).pipe(
      map(response => [Collection.fromJsonArray(response['response']['docs']), parseInt(response['response']['numFound'], 10)]));
  }

  getCollection(id: string): Observable<Collection> {
    return this.clientApi.getMods(id).pipe(map(response => this.modsParser.getCollection(response, id)));
  }

  createCollection(collection: Collection): Observable<Object> {
    const payload = {
      name: collection.name,
      description: collection.description,
      content: collection.content
    }
    //TODO: implement using admin api
    return new Observable<Object>();
    //return this.post('/admin/collections', payload);
  }

  updateCollection(collection: Collection): Observable<Object> {
    const payload = {
      name: collection.name,
      description: collection.description,
      content: collection.content
    }
    //TODO: implement using admin api
    return new Observable<Object>();
    //return this.put(`/admin/collections/${collection.id}`, payload);
  }

  deleteCollection(collection: Collection): Observable<Object> {
    //TODO: implement using admin api
    return new Observable<Object>();
    //return this.delete(`/admin/collections/${collection.id}`);
  }
}
