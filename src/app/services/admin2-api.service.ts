import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { License } from '../models/license.model';
import { map } from 'rxjs/operators';
import { Role } from '../models/roles.model';
import { Right } from '../models/right.model';
import { ConditionParam } from '../models/condition-param.model';

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

  private delete(path: string, params = {}): Observable<Object> {
    return this.http.delete(`${this.baseUrl}${path}`, {
      params: params,
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

  getConditions(): Observable<any> {
    return this.get('rights/criteria');
  }

  getRights(): Observable<Right[]> {
    return this.get('rights').pipe(map(response => 
      Right.fromJsonArray(response)));
  }

  updateRight(right: Right): Observable<Right> {
    return this.put(`rights`, right.toJson()).pipe(map(response => 
      Right.fromJson(response)));
  }

  createRight(right: Right): Observable<Right> {
    return this.post(`rights`, right.toJson()).pipe(map(response => 
      Right.fromJson(response)));
  }

  removeRight(right: Right): Observable<any> {
    return this.delete(`rights`, { id: right.id});
  }

  getConditionParams(): Observable<ConditionParam[]> {
    return this.get('rights/params').pipe(map(response => 
      ConditionParam.fromJsonArray(response)));
  }

  createConditionParam(param: ConditionParam): Observable<ConditionParam> {
    return this.post(`rights/params`, param.toJson()).pipe(map(response => 
      ConditionParam.fromJson(response)));
  }

  updateConditionParam(param: ConditionParam): Observable<ConditionParam> {
    return this.put(`rights/params`, param.toJson()).pipe(map(response => 
      ConditionParam.fromJson(response)));
  }

  removeConditionParam(param: ConditionParam): Observable<any> {
    return this.delete(`rights/params`, { id: param.id });
  }

  getRoles(): Observable<Role[]> {
    return this.get('roles').pipe(map(response => 
      Role.fromJsonArray(response)));
  }

  createRole(role: Role): Observable<Role> {
    return this.post(`roles`, role.toJson()).pipe(map(response => 
      Role.fromJson(response)));
  }

  updateRole(role: Role): Observable<Role> {
    return this.put(`roles`, role.toJson()).pipe(map(response => 
      Role.fromJson(response)));
  }

  removeRole(role: Role): Observable<any> {
    return this.delete(`roles`, { id: role.id });
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
    return this.delete(`licenses`, { id: license.id });
  }

}

