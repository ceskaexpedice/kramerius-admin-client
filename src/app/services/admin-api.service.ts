import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppSettings } from './app-settings';
import { Batch } from '../models/batch.model';
import { map, tap } from 'rxjs/operators';
import { ProcessOwner } from '../models/process-owner.model';
import { Process } from '../models/process.model';
import { Collection } from '../models/collection.model';

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {

  private baseUrl: string;

  constructor(private http: HttpClient, private appSettings: AppSettings) {
    this.baseUrl = this.appSettings.adminApiBaseUrl;
  }

  private doGet(path: string, params, type = 'json'): Observable<Object> {
    const options = {
      params: params
    };
    if (type === 'text') {
      options['responseType'] = 'text';
      options['observe'] = 'response';
    }
    return this.http.get(this.baseUrl + path, options);
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
    return this.get('/processes/batches', params).pipe(
      //tap(response => console.log(response)),
      map(response => [Batch.fromJsonArray(response['batches']), response['total_size']])
    );
  }

  getProcessLogs(procesUuid: string, logType: string, offset: number, limit: number): Observable<any> {
    return this.get(`/processes/by_process_uuid/${procesUuid}/logs/${logType}`, {
      'offset': offset,
      'limit': limit
    }).pipe(
      //tap(response => console.log(response)),
      //map(response => [Batch.fromJsonArray(response['batches']), response['total_size']])
    );
  }

  getProcess(processId: number): Observable<[Batch, Process]> {
    return this.get(`/processes/by_process_id/${processId}`).pipe(
      //tap(response => console.log(response)),
      map(response => [Batch.fromJson(response), Process.fromJson(response['process'])])
    );
  }

  getProcessOwners(): Observable<ProcessOwner[]> {
    return this.get('/processes/owners').pipe(map(response => ProcessOwner.fromJsonArray(response['owners'])));
  }

  scheduleProcess(definition): Observable<any> {
    return this.post('/processes', definition);
  }

  killBatch(firstProcessId: number): Observable<any> {
    return this.delete(`/processes/batches/by_first_process_id/${firstProcessId}/execution`);
  }

  deleteProcessBatch(firstProcessId: number) {
    return this.delete(`/processes/batches/by_first_process_id/${firstProcessId}`);
  }

  createCollection(collection: Collection): Observable<any> {
    const payload = {
      name: collection.name,
      description: collection.description,
      content: collection.content,
      standalone: collection.standalone
    }
    return this.post(`/collections`, payload);
  }

  getCollections(): Observable<any> {
    //TODO: offset, limit
    return this.get(`/collections`);
  }

  getCollectionsContainingItem(itemPid: String) {
    return this.get(`/collections?withItem=${itemPid}`);
  }

  getCollection(id: string): Observable<any> {
    return this.get(`/collections/${id}`);
  }

  updateCollection(collection: Collection): Observable<any> {
    const payload = {
      name: collection.name,
      description: collection.description,
      content: collection.content,
      standalone: collection.standalone
    }
    return this.put(`/collections/${collection.id}`, payload);
  }

  deleteCollection(id: string): Observable<any> {
    return this.delete(`/collections/${id}`);
  }

  addItemToCollection(collectionPid: string, itemPid: string): Observable<Object> {
    return this.post(`/collections/${collectionPid}/items`, itemPid);
  }

  removeItemFromCollection(collectionPid: string, itemPid: string): Observable<Object> {
    return this.delete(`/collections/${collectionPid}/items/${itemPid}`);
  }

  deleteObject(pid: string): Observable<any> {
    return this.delete(`/items/${pid}`);
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

