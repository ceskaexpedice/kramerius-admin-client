import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppSettings } from './app-settings';
import { Batch } from '../models/batch.model';
import { map, tap } from 'rxjs/operators';
import { ProcessOwner } from '../models/process-owner.model';
import { Process } from '../models/process.model';
import { Collection } from '../models/collection.model';

@Injectable()
export class ApiService {

  private baseUrl: string;

  constructor(private http: HttpClient, private appSettings: AppSettings) {
    this.baseUrl = this.appSettings.adminApiBase;
  }

  private get(path: string, params = {}): Observable<Object> {
    return this.http.get(this.baseUrl + path, { params: params });
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
    return this.get('/admin/processes/by_process_id/' + processId).pipe(
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

  deleteProcessBatch(firstProcessId: number) {
    return this.delete('/admin/processes/batches/by_first_process_id/' + firstProcessId);
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


}



export interface ProcessesParams {
  limit: number;
  offset: number;
  from?: string;
  until?: string;
  state?: string;
  owner?: string;
}