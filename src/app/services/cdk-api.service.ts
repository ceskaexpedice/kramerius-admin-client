import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { AppSettings } from './app-settings';
import { Batch } from '../models/batch.model';
import { catchError, delay, map, tap } from 'rxjs/operators';
import { ProcessOwner } from '../models/process-owner.model';
import { Process } from '../models/process.model';
import { Collection } from '../models/collection.model';
import { File } from '../models/tree.model';
import { License } from '../models/license.model';
import { Role } from '../models/roles.model';
import { ConditionParam } from '../models/condition-param.model';
import { Right } from '../models/right.model';
import { RightAction } from '../models/right-action.model';
import { Library, Reharvest, StatusTimtamp } from '../models/cdk.library.model';
import { AdminApiService } from './admin-api.service';

@Injectable({
  providedIn: 'root'
})
export class CdkApiService {

    private cdkUrl: string;

    constructor(private http: HttpClient, private appSettings: AppSettings) {
      this.cdkUrl = this.appSettings.cdkApiBaseUrl;
    }
 

    private doGet(path: string, params, type = 'json'): Observable<Object> {
        const options = {
          params: params
        };
        if (type === 'text') {
          options['responseType'] = 'text';
          options['observe'] = 'response';
        }
        let url = this.cdkUrl + path;
        return this.http.get(url, options);
    }
    
    
    private doPut(path: string, body:any, params, type = 'json'): Observable<Object> {
        const options = {
          params: params
        };
        if (type === 'text') {
          options['responseType'] = 'text';
          options['observe'] = 'response';
        }
        let url = this.cdkUrl + path;
        if (body) {
          return this.http.put(url, body, options);
        } else {
          return this.http.put(url,  options);
        }
    }

    private delete(path: string, options = {}): Observable<Object> {
      let url = this.cdkUrl + path;
      return this.http.delete(url, options);
    }
  


    setStatus(code:string, status:boolean) : Observable<any>{
      return this.doPut(`/api/admin/v7.0/connected/${code}/status?status=${status}`,null,{}).pipe(map(response => Library.oneLibFromJson(code, response)));
    }

    connected(): Observable<any[]> {
        return this.doGet('/api/admin/v7.0/connected',{}).pipe(map(response => Library.libsFromJson(response)));
    }

    mapping(code): Observable<any> {
      return this.doGet(`/api/admin/v7.0/connected/${code}/associations`,{}).pipe();
    }

    timestamps(code): Observable<any[]> {
      return this.doGet(`/api/admin/v7.0/connected/${code}/timestamps`,{}).pipe(map(response => StatusTimtamp.statusesFromJson(response)));
    }

    config(code): Observable<any> {
      return this.doGet(`/api/admin/v7.0/connected/${code}/config`,{}).pipe();
    }

    channel(code): Observable<any> {
      return this.doGet(`/api/admin/v7.0/connected/${code}/config/channel/health`,{}).pipe();
    }

    reharvests(): Observable<any[]> {
      return this.doGet('/api/admin/v7.0/reharvest',{}).pipe(map(response => Reharvest.reharvestsFromJson(response)));
    }

    introspectPid(pid): Observable<any> {
      return this.doGet(`/api/admin/v7.0/items/${pid}/solr/instintrospect`,{}).pipe();
    }



    planReharvest(obj:any) {
      return this.doPut('/api/admin/v7.0/reharvest', obj, {}).pipe(
        tap((response: HttpResponse<Object>) => {}),
        map(response => Reharvest.reharvestFromJson(response))
        // catchError((error: any) => {
        //   return throwError(() => new Error('An error occurred while reharvesting.'));
        // })
      );

    }

    deleteReharvest(id:string):Observable<any> {
      return this.  delete(`/api/admin/v7.0/reharvest/${id}`).pipe();
    }

    changeReharvestState(id:string, state:string) {
      return this.doPut(`/api/admin/v7.0/reharvest/${id}/state?state=${state}`,{},{}).pipe(map(response => Reharvest.reharvestFromJson(response)));
    }


    // MOVE to server
    registrinfo():Observable<any> {
      return this.http.get("https://api.registr.digitalniknihovna.cz/api/libraries/", {}).pipe();
    } 

    oneRegistrinfo(code:string):Observable<any> {
      return this.http.get(`https://api.registr.digitalniknihovna.cz/api/libraries/${code}`, {}).pipe();
    } 

    
}