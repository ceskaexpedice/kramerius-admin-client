import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Collection } from '../models/collection.model';
import { ClientApiService } from './client-api.service';
import { AdminApiService } from './admin-api.service';

@Injectable({
  providedIn: 'root'
})
export class CollectionsService {

  constructor(private clientApi: ClientApiService, private adminApi: AdminApiService) { }

  //collections CRUD

  createCollection(collection: Collection): Observable<Object> {
    return this.adminApi.createCollection(collection);
  }

  getCollections(lang:string, page: number, rows: number): Observable<[Collection[], number]> {
    //TODO: use offset, limit
    return this.adminApi.getCollections().pipe(
      map(response => {
        //console.log(response);
        return [Collection.fromAdminApiJsonArray(lang, response['collections']), parseInt(response['total_size'], 10)]
      }));
  }

  getCollectionsByPrefix(lang:string, page: number, rows: number, prefix: string): Observable<[Collection[], number]> {
    return this.adminApi.getCollectionsByPrefix(rows, page, prefix).pipe(
      map(response => {
        return [Collection.fromAdminApiJsonArray(lang,response['collections']), parseInt(response['total_size'], 10)]
      }));
  }

  getCollectionsContainingItem(lang:string, itemPid: String): Observable<[Collection[], number]> {
    return this.adminApi.getCollectionsContainingItem(itemPid).pipe(
      map(response => {
        //console.log(response);
        return [Collection.fromAdminApiJsonArray(lang, response['collections']), parseInt(response['total_size'], 10)]
      }));
  }

  getCollection(id: string): Observable<Collection> {
    return this.adminApi.getCollection(id).pipe(map(response => {
      return Collection.fromAdminApiJson(response);
    }));
  }

  updateCollection(collection: Collection): Observable<any> {
    return this.adminApi.updateCollection(collection);
  }

  deleteCollection(collection: Collection): Observable<Object> {
    return this.adminApi.deleteCollection(collection.id);
  }

  //item-in-collection CRUD

  addItemToCollection(collectionPid: string, itemPid: string): Observable<Object> {
    return this.adminApi.addItemToCollection(collectionPid, itemPid);
  }

  addItemsToCollection(collectionPid: string, itemsPids: string[]): Observable<Object> {
    return this.adminApi.addItemsToCollection(collectionPid, itemsPids);
  }

  removeItemFromCollection(collectionPid: string, itemPid: string): Observable<Object> {
    return this.adminApi.removeItemFromCollection(collectionPid, itemPid);
  }

  removeBatchItemsFromCollection(collectionPid: string, itemPids: string[]): Observable<Object> {
    return this.adminApi.removeItemsBatchFromCollection(collectionPid, itemPids);
  }


}
