import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AppSettings } from './app-settings';
import { Batch } from '../models/batch.model';
import { delay, map, tap } from 'rxjs/operators';
import { ProcessOwner } from '../models/process-owner.model';
import { Process } from '../models/process.model';
import { Collection } from '../models/collection.model';
import { File } from '../models/tree.model';
import { License } from '../models/license.model';
import { Role } from '../models/roles.model';
import { ConditionParam } from '../models/condition-param.model';
import { Right } from '../models/right.model';
import { RightAction } from '../models/right-action.model';
import { Library } from '../models/cdk.library.model';

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
    
    private doPut(path: string, params, type = 'json'): Observable<Object> {
        const options = {
          params: params
        };
        if (type === 'text') {
          options['responseType'] = 'text';
          options['observe'] = 'response';
        }
        let url = this.cdkUrl + path;
        return this.http.put(url, options);
    }


    setStatus(code:string, status:boolean) : Observable<any>{
      return this.doPut(`/api/admin/v7.0/connected/${code}/status?status=${status}`,{}).pipe(map(response => Library.oneLibFromJson(code, response)));
    }

    connected(): Observable<any[]> {
        return this.doGet('/api/admin/v7.0/connected',{}).pipe(map(response => Library.libsFromJson(response)));

    }
    
    // MOVE to server
    registrinfo():Observable<any> {
      return this.http.get("https://api.registr.digitalniknihovna.cz/api/libraries/", {}).pipe();
    } 
}