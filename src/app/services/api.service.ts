import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from './app-settings';
import { Batch } from '../models/batch.model';
import { map } from 'rxjs/operators';
import { ProcessOwner } from '../models/process-owner.model';

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
    return this.get('/admin/processes/batches', params).pipe(map(response => [Batch.fromJsonArray(response['batches']), response['total_size']]));
  }

  getProcessOwners(): Observable<ProcessOwner[]> {
    return this.get('/admin/processes/owners').pipe(map(response => ProcessOwner.fromJsonArray(response['owners'])));
  }

  scheduleProcess(definition): Observable<any> {
    return this.post('/admin/processes', definition);
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