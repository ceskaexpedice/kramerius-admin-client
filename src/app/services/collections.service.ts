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

  getCollections(offset: number, limit: number): Observable<[Collection[], number]> {
    //TODO: use offset, limit
    return this.adminApi.getCollections().pipe(
      map(response => {
        //console.log(response);
        return [Collection.fromAdminApiJsonArray(response['collections']), parseInt(response['total_size'], 10)]
      }));
  }

  getCollectionsContainingItem(itemPid: String): Observable<[Collection[], number]> {
    return this.adminApi.getCollectionsContainingItem(itemPid).pipe(
      map(response => {
        //console.log(response);
        return [Collection.fromAdminApiJsonArray(response['collections']), parseInt(response['total_size'], 10)]
      }));
  }

  getCollection(id: string): Observable<Collection> {
    return this.adminApi.getCollection(id).pipe(map(response => {
      //console.log(response);
      return Collection.fromAdminApiJson(response);
    }));
  }

  updateCollection(collection: Collection): Observable<Object> {
    return this.adminApi.updateCollection(collection);
  }

  deleteCollection(collection: Collection): Observable<Object> {
    return this.adminApi.deleteCollection(collection.id);
  }

  //item-in-collection CRUD

  addItemToCollection(collectionPid: string, itemPid: string): Observable<Object> {
    return this.adminApi.addItemToCollection(collectionPid, itemPid);
  }

  removeItemFromCollection(collectionPid: string, itemPid: string): Observable<Object> {
    return this.adminApi.removeItemFromCollection(collectionPid, itemPid);
  }


}
