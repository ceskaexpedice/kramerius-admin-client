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
import { Library, StatusTimtamp } from '../models/cdk.library.model';

@Injectable({
  providedIn: 'root'
})
export class OAIApiService {


    private baseUrl: string;

    constructor(private http: HttpClient, private appSettings: AppSettings) {
      this.baseUrl = this.appSettings.harvestAapiBaseURL;
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
        return this.http.get(url, options);
    }



    info(set): Observable<any> {
      return this.doGet(`/info?set=${set}`,{}).pipe();
    }

    defaultInfo(): Observable<any> {
      return this.doGet(`/info?`,{}).pipe();
    }
    
}