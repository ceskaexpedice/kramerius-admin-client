import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from './app-settings';

@Injectable()
export class ApiService {

  private baseUrl: string;

  constructor(private http: HttpClient, private appSettings: AppSettings) {
    this.baseUrl = this.appSettings.krameriusApiBase;
  }

  private get(path: string, params = {}): Observable<Object> {
    return this.http.get(this.baseUrl + path, {params: params});
  }

  private post(path: string, body: any = null): Observable<Object> {
    return this.http.post(this.baseUrl + path, body);
  }

  private delete(path: string): Observable<Object> {
    return this.http.delete(this.baseUrl + path, {});
  }

  private put(path: string, body: any, options: any = {}): Observable<Object> {
    return this.http.put(this.baseUrl + path, body, options);
  }



}
