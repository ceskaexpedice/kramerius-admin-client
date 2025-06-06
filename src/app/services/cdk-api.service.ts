import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { AppSettings } from './app-settings';
import { Batch } from '../models/batch.model';
import { catchError, delay, filter, map, tap } from 'rxjs/operators';
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
 

    private doGet(path: string, params: any, type = 'json'): Observable<Object> {
        const options: any = {
          params: params
        };
        if (type === 'text') {
          options['responseType'] = 'text';
          options['observe'] = 'response';
        }
        let url = this.cdkUrl + path;
        return this.http.get(url, options);
    }
    
    
    private doPut(path: string, body:any, params: any, type = 'json'): Observable<Object> {
        const options: any = {
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

    mapping(code: string): Observable<any> {
      return this.doGet(`/api/admin/v7.0/connected/${code}/associations`,{}).pipe();
    }

    timestamps(code: string): Observable<any[]> {
      return this.doGet(`/api/admin/v7.0/connected/${code}/timestamps`,{}).pipe(map(response => StatusTimtamp.statusesFromJson(response)));
    }

    config(code: string): Observable<any> {
      return this.doGet(`/api/admin/v7.0/connected/${code}/config`,{}).pipe();
    }

    channel(code: string): Observable<any> {
      return this.doGet(`/api/admin/v7.0/connected/${code}/config/channel/health`,{}).pipe();
    }

    reharvests(page:number, rows:number, pid:string, filters:string[]): Observable<any> {
      let sfitlers = filters.join(';');
      if(pid) sfitlers = sfitlers+";pid:\""+pid+"\"";
      if (sfitlers === '') {
        return this.doGet(`/api/admin/v7.0/reharvest?page=${page}&rows=${rows}`,{}).pipe();
      } else {
        return this.doGet(`/api/admin/v7.0/reharvest?page=${page}&rows=${rows}&filters=${sfitlers}`,{}).pipe();
      }
    }

    introspectPid(pid:string): Observable<any> {
      return this.doGet(`/api/admin/v7.0/items/${pid}/solr/instintrospect`,{}).pipe();
    }


    planReharvest(obj:any) {
      return this.doPut('/api/admin/v7.0/reharvest', obj, {}).pipe(
        //tap((response: HttpResponse<Object>) => {}),
        map(response => Reharvest.reharvestFromJson(response))
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

    



  /** generic api monitor search */
  apiMonitorSearch(pageIndex:number,  pageSize:number,   dateFrom: Date, dateTo: Date,   filter:any[] ) {
    let params: HttpParams = this.searchParams(pageIndex, pageSize, dateFrom, dateTo, filter);

    return this.get(`/api/admin/v7.0/monitor/search`, params);
  }
  private get(path: string, params = {}): Observable<Object> {
    return this.doGet(path, params);
  }


  private searchParams( pageIndex:number, pageSize: number, dateFrom: Date, dateTo: Date, filter: any[]) {
    //q=*:*&sort=duration+desc&facet=true&facet.field=labels
    


    let params: HttpParams = new HttpParams();
    params = params.set('q', '*');
    params = params.set('rows', pageSize);
    params = params.set('start', pageIndex*pageSize);
    params = params.set('sort', 'duration desc');

    params = params.append('facet', 'true');
    params = params.append('facet.field', 'labels');
    params = params.append('facet.field', 'resource');
    params = params.append('facet.sort', 'index');



    if (dateFrom && dateTo) {

      params = params.append('fq', `startTime:[${dateFrom.toISOString()} TO ${dateTo.toISOString()}]`);
    } else if (dateFrom && !dateTo) {
      params = params.append('fq', `startTime:[${dateFrom.toISOString()} TO *]`);
    } else if (!dateFrom && dateTo) {
      params = params.append('fq', `startTime:[* TO ${dateTo.toISOString()}]`);
    }
    /*
      filterKey: string;
  // node_1
  filterVal:string;
*/


     if (filter) {
      for (let i = 0; i < filter.length; i++) {
        let lf = filter[i];
        params = params.append('fq', `${lf}`);
      }
    }
    return params;
  }

}