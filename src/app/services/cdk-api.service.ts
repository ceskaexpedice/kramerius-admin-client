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
import { Library, Reharvest, StatusTimtamp } from '../models/cdk.library.model';

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
      //http://localhost:8080/search/api/admin/v7.0/connected/knav/timestamps
      return this.doGet(`/api/admin/v7.0/connected/${code}/timestamps`,{}).pipe(map(response => StatusTimtamp.statusesFromJson(response)));
    }


    reharvests(): Observable<any[]> {
      //search/api/admin/v7.0/reharvest
      return this.doGet('/api/admin/v7.0/reharvest',{}).pipe(map(response => Reharvest.reharvestsFromJson(response)));
    }

    planReharvest(obj:any) {
      //https://api.val.ceskadigitalniknihovna.cz/search/api/admin/v7.0/reharvest
      return this.doPut('/api/admin/v7.0/reharvest',obj,{}).pipe(map(response => Reharvest.reharvestFromJson(response)));
    }

    changeReharvestState(id:string, state:string) {
      return this.doPut(`/api/admin/v7.0/reharvest/${id}/state?state=${state}`,{},{}).pipe(map(response => Reharvest.reharvestFromJson(response)));
    }

    // @PUT
    // @Path("{id}/state")
    // @Produces(MediaType.APPLICATION_JSON)
    // public Response changeState(@PathParam("id") String id, @QueryParam("state") String state) {
  



    // MOVE to server
    registrinfo():Observable<any> {
      return this.http.get("https://api.registr.digitalniknihovna.cz/api/libraries/", {}).pipe();
    } 

    oneRegistrinfo(code:string):Observable<any> {
      return this.http.get(`https://api.registr.digitalniknihovna.cz/api/libraries/${code}`, {}).pipe();
    } 

    
}