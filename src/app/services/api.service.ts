import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppSettings } from './app-settings';
import { Batch } from '../models/batch.model';
import { map, tap } from 'rxjs/operators';
import { ProcessOwner } from '../models/process-owner.model';
import { Process } from '../models/process.model';
import { Collection } from '../models/collection.model';
import { ModsParserService } from './mods-parser.service';

@Injectable()
export class ApiService {

  private baseUrl: string;

  constructor(private http: HttpClient, private appSettings: AppSettings, private mods: ModsParserService) {
    this.baseUrl = this.appSettings.adminApiBase;
  }

  private doGet(path: string, params, type = 'json'): Observable<Object> {
    const options = {
      params: params
    };
    if (type === 'text') {
      options['responseType'] = 'text';
      options['observe'] = 'response';
    }
    let url = this.baseUrl + path;
    //TODO: odstranit do produkce pouzivani /api/v5.0/item
    url = url.replace(/api\/v6\.0\/item/, "api/v5.0/item");
    return this.http.get(url, options);
  }

  private get(path: string, params = {}): Observable<Object> {
    return this.doGet(path, params);
  }

  private getText(path: string, params = {}): Observable<string> {
    return this.doGet(path, params, 'text').pipe(map(response => response['body']));
  }

  private post(path: string, body, options = {}): Observable<Object> {
    return this.http.post(this.baseUrl + path, body, options);
  }

  private delete(path: string): Observable<Object> {
    return this.http.delete(this.baseUrl + path, {});
  }

  private put(path: string, body: any, options: any = {}): Observable<Object> {
    return this.http.put(this.baseUrl + path, body, options);
  }

  getProcesses(params: ProcessesParams): Observable<[Batch[], number]> {
    return this.get('/admin/processes/batches', params).pipe(
      //tap(response => console.log(response)),
      map(response => [Batch.fromJsonArray(response['batches']), response['total_size']])
    );
  }

  getProcessLogs(procesUuid: string, logType: string, offset: number, limit: number): Observable<any> {
    return this.get(`/admin/processes/by_process_uuid/${procesUuid}/logs/${logType}`, {
      'offset': offset,
      'limit': limit
    }).pipe(
      tap(response => console.log(response)),
      //map(response => [Batch.fromJsonArray(response['batches']), response['total_size']])
    );
  }

  getProcess(processId: number): Observable<[Batch, Process]> {
    return this.get(`/admin/processes/by_process_id/${processId}`).pipe(
      //tap(response => console.log(response)),
      map(response => [Batch.fromJson(response), Process.fromJson(response['process'])])
    );
  }

  getProcessOwners(): Observable<ProcessOwner[]> {
    return this.get('/admin/processes/owners').pipe(map(response => ProcessOwner.fromJsonArray(response['owners'])));
  }

  scheduleProcess(definition): Observable<any> {
    return this.post('/admin/processes', definition);
  }

  killBatch(firstProcessId: number): Observable<any> {
    return this.delete(`/admin/processes/batches/by_first_process_id/${firstProcessId}/execution`);
  }

  deleteProcessBatch(firstProcessId: number) {
    return this.delete(`/admin/processes/batches/by_first_process_id/${firstProcessId}`);
  }

  getCollections(offset: number, limit: number): Observable<[Collection[], number]> {
    const params = {
      q: 'n.model:collection',
      fl: 'n.pid,n.title.search,n.collection.desc,n.created,n.modified',
      rows: limit,
      start: offset
    };
    return this.get('/search', params).pipe(
      map(response => [Collection.fromJsonArray(response['response']['docs']), parseInt(response['response']['numFound'], 10)]));
  }

  getMods(uuid: string): Observable<string> {
    return this.getText(`/item/${uuid}/streams/BIBLIO_MODS`);
  }

  getCollection(id: string): Observable<Collection> {
    return this.getMods(id).pipe(map(response => this.mods.getCollection(response, id)));
  }

  createCollection(collection: Collection) {
    const payload = {
      name: collection.name,
      description: collection.description,
      content: collection.content
    }
    return this.post('/admin/collections', payload);
  }

  updateCollection(collection: Collection) {
    const payload = {
      name: collection.name,
      description: collection.description,
      content: collection.content
    }
    return this.put(`/admin/collections/${collection.id}`, payload);
  }

  deleteCollection(collection: Collection) {
    return this.delete(`/admin/collections/${collection.id}`);
  }

}



export interface ProcessesParams {
  limit: number;
  offset: number;
  from?: string;
  until?: string;
  state?: string;
  owner?: string;
}