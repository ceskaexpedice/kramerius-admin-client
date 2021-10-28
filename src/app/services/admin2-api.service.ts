import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { License } from '../models/license.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class Admin2ApiService {

  private baseUrl = '/search/api/v5.0/admin/'

  constructor(private http: HttpClient) {
  }

  private get(path: string, params = {}): Observable<Object> {
    return this.http.get(`${this.baseUrl}${path}`, {
      params: params,
      headers: new HttpHeaders({
        "Authorization": "Basic " + btoa("krameriusAdmin:krameriusAdmin")
      })});
  }


  private post(path: string, body): Observable<Object> {
    return this.http.post(`${this.baseUrl}${path}`, body, {
      headers: new HttpHeaders({
        "Authorization": "Basic " + btoa("krameriusAdmin:krameriusAdmin")
      })}
      );
  }

  private delete(path: string, body = null): Observable<Object> {
    return this.http.request('DELETE', `${this.baseUrl}${path}`, {
      body: body,
      headers: new HttpHeaders({
        "Authorization": "Basic " + btoa("krameriusAdmin:krameriusAdmin")
      })});  
  }

  private put(path: string, body: any, options: any = {}): Observable<Object> {
    return this.http.put(`${this.baseUrl}${path}`, body, {
      headers: new HttpHeaders({
        "Authorization": "Basic " + btoa("krameriusAdmin:krameriusAdmin")
      })}
      );
  }

  getRights(): Observable<any> {
    return this.get('rights');
  }

  getLicenses(): Observable<License[]> {
    return this.get('licenses').pipe(map(response => 
      License.fromJsonArray(response)));
  }

  createLicense(license: License): Observable<License> {
    return this.post(`licenses`, license.toJson()).pipe(map(response => 
      License.fromJson(response)));
  }

  updateLicense(license: License): Observable<License> {
    return this.put(`licenses`, license.toJson()).pipe(map(response => 
      License.fromJson(response)));
  }


  removeLicense(license: License): Observable<any> {
    return this.delete(`licenses`, license.toJson());
  }

}

