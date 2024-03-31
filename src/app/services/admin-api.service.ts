import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AppSettings } from './app-settings';
import { Batch } from '../models/batch.model';
import { delay, map, tap } from 'rxjs/operators';
import { ProcessOwner } from '../models/process-owner.model';
import { Process } from '../models/process.model';
import { Collection } from '../models/collection.model';
import { File  as TreeFile} from '../models/tree.model';

import { License } from '../models/license.model';
import { Role } from '../models/roles.model';
import { ConditionParam } from '../models/condition-param.model';
import { Right } from '../models/right.model';
import { RightAction } from '../models/right-action.model';
import { SdnntItem, SdnntSync } from '../models/sdnnt.model';

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {

  private baseUrl: string;

  constructor(private http: HttpClient, private appSettings: AppSettings) {
    this.baseUrl = this.appSettings.adminApiBaseUrl;
  }

  private doGet(path: string, params, type = 'json'): Observable<Object> {
    const options = {
      params: params
    };
    if (type === 'text') {
      options['responseType'] = 'text';
      options['observe'] = 'response';
    }
    return this.http.get(this.baseUrl + path, options);
  }

  private get(path: string, params = {}): Observable<Object> {
    return this.doGet(path, params);
  }

  private getText(path: string, params = {}): Observable<string> {
    return this.doGet(path, params, 'text').pipe(map(response => response['body']));
  }

  private head(path: string, options = {}): Observable<Object> {
    return this.http.head(this.baseUrl + path, options);
  }

  private post(path: string, body, options = {}): Observable<Object> {
    return this.http.post(this.baseUrl + path, body, options);
  }

  private delete(path: string, options = {}): Observable<Object> {
    return this.http.delete(this.baseUrl + path, options);
  }

  private put(path: string, body: any, options: any = {}): Observable<Object> {
    return this.http.put(this.baseUrl + path, body, options);
  }

  getLocksByLicense(license:string): Observable<any> {
    return this.get(`/locks/license/${license}`, {}).pipe(
    );
  }

  getLocksItems(hash:string): Observable<any> {
    return this.get(`/locks/${hash}`, {}).pipe(
    );
  }

  getGeneralQuery(path: string): Observable<any> {
    const options = { headers: new HttpHeaders({ 'Accept': '*' }) };
    return this.http.get(this.baseUrl + path, options);
    //return this.get(path);
  }

  checkObject(pid: string): Observable<any> {
    return this.head(`/items/${pid}`)
    //.pipe(delay(3000));
  }

  getFoxml(pid: string): Observable<any> {
    return this.getText(`/items/${pid}/foxml`)
    //.pipe(delay(3000));
  }

  getObjectsByModel(model: string, order = 'ASC', offset: number, limit: number): Observable<any> {
    return this.get(`/items?order=${order}&offset=${offset}&limit=${limit}`, {
      'model': model
    }).pipe(
      tap(response => {
        //console.log(offset + ", " + limit);
        //console.log(response)
      })
    );
  }

  getObjectsByModelWithCursor(model: string, order = 'ASC', cursor: string, limit: number): Observable<any> {
    return this.get(`/items?order=${order}&cursor=${encodeURIComponent(cursor)}&limit=${limit}`, {
      'model': model
    }).pipe(
      //delay(500),
      tap(response => {
        //console.log(response)
      })
    );
  }

  getProcesses(params: ProcessesParams): Observable<[Batch[], number]> {
    return this.get('/processes/batches', params).pipe(
      //delay(2000),
      //tap(response => console.log(response)),
      map(response => [Batch.fromJsonArray(response['batches']), response['total_size']])
    );
  }

  getProcessLogs(procesUuid: string, logType: string, offset: number, limit: number): Observable<any> {
    return this.get(`/processes/by_process_uuid/${procesUuid}/logs/${logType}/lines`, {
      'offset': offset,
      'limit': limit
    }).pipe(
      //tap(response => console.log(response)),
      //map(response => [Batch.fromJsonArray(response['batches']), response['total_size']])
    );
  }

  getProcessLogsUrl(procesUuid: string, logType: string, fileName: string): string {
    return `${this.baseUrl}/processes/by_process_uuid/${procesUuid}/logs/${logType}?fileName=${fileName}`;
  }

  getProcess(processId: number): Observable<[Batch, Process]> {
    return this.get(`/processes/by_process_id/${processId}`).pipe(
      //tap(response => console.log(response)),
      map(response => [Batch.fromJson(response), Process.fromJson(response['process'])])
    );
  }



  getProcessOwners(): Observable<ProcessOwner[]> {
    return this.get('/processes/owners').pipe(
      //delay(3000),
      map(response => ProcessOwner.fromJsonArray(response['owners']))
    );
  }

  scheduleProcess(definition, onScheduled = undefined): Observable<any> {
    return this.post('/processes', definition).pipe(
      //delay(Math.floor(Math.random() * 5000)),
      tap(response => { if (onScheduled) onScheduled(response); }),
    )
  }

  killBatch(firstProcessId: number): Observable<any> {
    return this.delete(`/processes/batches/by_first_process_id/${firstProcessId}/execution`).pipe(
      //delay(3000)
    )
  }

  deleteProcessBatch(firstProcessId: number) {
    return this.delete(`/processes/batches/by_first_process_id/${firstProcessId}`).pipe(
      //delay(3000),
    )
  }


  uploadCollectionThumbnail(collectionPid:string, file:File):Observable<any> {
    let formData: FormData = new FormData();
    formData.append('file', file, file.name);
    console.log("Form data "+formData);
    let tf = formData.get('file');
    console.log("TF "+tf);

    return this.post(`/collections/${collectionPid}/image/thumb`, formData);
  }  
  
  createCollection(collection: Collection): Observable<any> {
    const payload = {
      names: collection.names,
      descriptions: collection.descriptions,
      contents:collection.contents,
      standalone: collection.standalone,
      thumbnail:collection.thumbnail
    }
    return this.post(`/collections`, payload);
  }

  getCollections(): Observable<any> {
    return this.get(`/collections`);
  }

  getCollectionsByPrefix(rows: number, page: number, prefix: string): Observable<any> {
    return this.get(`/collections/prefix?rows=${rows}&page=${page}&prefix=${prefix}`);
  }

  getCollectionsContainingItem(itemPid: String) {
    return this.get(`/collections?withItem=${itemPid}`)
    //.pipe(delay(3000));
  }

  getCollection(id: string): Observable<any> {
    return this.get(`/collections/${id}`);
  }

  getSdntSyncInfo(): Observable<any> {
    return this.get(`/sdnnt/info`);
  }

  getSdntSyncTimestamp(): Observable<any> {
    return this.get(`/sdnnt/sync/timestamp`);
  }

  getSdntSyncBatches(): Observable<any> {
    return this.get(`/sdnnt/sync/batches`);
  }

  getSdntSyncData(rows: number, page: number): Observable<SdnntSync> {
   return this.get(`/sdnnt/sync?rows=${rows}&page=${page}`).pipe(map(response => SdnntSync.fromJson(response)));
  }

  getSdntSyncDataGranularity(id:string): Observable<SdnntItem[]> {
    return this.get(`/sdnnt/sync/granularity/${id}`).pipe(map((response) => {
      let val = response[id];
      return SdnntItem.fromJsonArray(val);
    }));
}

  updateCollection(collection: Collection): Observable<any> {
    const payload = {
      names: collection.names,
      descriptions: collection.descriptions,
      contents: collection.contents,
      keywords:collection.keywords,
      standalone: collection.standalone,
      author: collection.author
    }
    return this.put(`/collections/${collection.id}`, payload);
  }

  deleteCollection(id: string): Observable<any> {
    return this.delete(`/collections/${id}`);
  }

  addItemToCollection(collectionPid: string, itemPid: string): Observable<Object> {
    return this.post(`/collections/${collectionPid}/items`, itemPid);
  }

  addItemsToCollection(collectionPid: string, itemsPids: string[]): Observable<Object> {
    return this.post(`/collections/${collectionPid}/items`, itemsPids);
  }

  addCuttingItemToCollection(collectionPid, cutting:any) : Observable<Object> {
    return this.post(`/collections/${collectionPid}/add_clip_item`, cutting);
  }

  removeCuttingItemToCollection(collectionPid, cutting:any) : Observable<Object> {
    return this.put(`/collections/${collectionPid}/delete_clip_item`, cutting);
  }

  removeBatchCuttingItemsToCollection(collectionPid, cutting:any[]) : Observable<Object> {
    return this.put(`/collections/${collectionPid}/delete_batch_clipitems`, {"clipitems":cutting});
  }



  removeItemFromCollection(collectionPid: string, itemPid: string): Observable<Object> {
    return this.delete(`/collections/${collectionPid}/items/${itemPid}`);
  }

  removeItemsBatchFromCollection(collectionPid: string, itemPids: string[]): Observable<Object> {
    const payload = {
      pids: itemPids
    }
    return this.put(`/collections/${collectionPid}/items/delete_batch_items`, payload);
  }


  deleteObject(pid: string): Observable<any> {
    return this.delete(`/items/${pid}`);
  }

  getConfigProperty(key: string): Observable<any> {
    return this.get(`/config/${key}`).pipe(
      delay(300),
    )
  }

  setConfigProperty(key: string, value: string): Observable<any> {
    return this.put(`/config/${key}`, value).pipe(
      delay(300),
    )
  }

  deleteConfigProperty(key: string): Observable<any> {
    return this.delete(`/config/${key}`,{}).pipe(
      delay(300),
    )
  }
  
  deleteConfigProperites(obj:any): Observable<any> {
    return this.post(`/config/deleteProperties`, obj).pipe(
      delay(300),
    )
  }
  
  getConfigProperties(obj:any): Observable<any> {
    return this.post(`/config/getProperties`, obj).pipe(
      delay(300),
    )
  }


  setConfigProperties(obj:any): Observable<any> {
    return this.put(`/config`, obj).pipe(
      delay(300),
    )
  }


  setChildrenOrder(parentPid: string, childernPids: string[]): Observable<any> {
    return this.put(`/items/${parentPid}/children_order`, { parentPid: parentPid, childrenPids: childernPids }).pipe(
      delay(300),
    )
  }

  setThumbFromPage(targetPid: string, sourcePid: string): Observable<any> {
    return this.put(`/items/${targetPid}/streams/IMG_THUMB?srcPid=${sourcePid}`, undefined).pipe(
      delay(300),
    )
  }

  setMods(pid: string, mods: string): Observable<any> {
    const options = { headers: new HttpHeaders({ 'Content-Type': 'application/xml' }) };
    return this.put(`/items/${pid}/streams/BIBLIO_MODS`, mods, options).pipe(
      delay(300),
    )
  }

  getImportFiles(type: string, path: string): Observable<TreeFile[]> {
    console.log('type', type);
    let fullPath = '/files/';
    if (type == 'foxml') {
      fullPath += 'input-data-dir-for_import-foxml';
    } else if (type == 'ndk') {
      fullPath += 'input-data-dir-for_convert-and-import-ndk';
    }
    fullPath += path;
    console.log('path', path);
    console.log('fullPath', fullPath);

    // fullPath = '/files/input-data-dir-for_import-foxml/045b1250-7e47-11e0-add1-000d606f5dc6/';
    return this.get(fullPath).pipe(
      //delay(3000),
      map(response => response['files']));
  }

  //deprecated (use getImportFiles instead)
  getImportFoxmlInputDirFiles(): Observable<any> {
    return this.get(`/files/input-data-dir-for_import-foxml/`).pipe(
      //delay(300),
    )
  }

  getOutputNKPLogsDirFiles(): Observable<any> {
    return this.get(`/files/output-data-dir-for_nkplogs/`).pipe(
    )
  }

  //output-data-dir-for_nkplogs
  getOutputCollectionsBackupsDirFiles(): Observable<any> {
    return this.get(`/files/output-data-dir-for_collectionsbackup/`).pipe(
    )
  }

  getOutputCollectionsBackupsFile(file): Observable<any> {
      return this.get(`/files/output-data-dir-for_collectionsbackup/`+file+"?generatedownloads=true").pipe(
    )
  }

  getOutputNKPLogsFile(file): Observable<any> {
    return this.get(`/files/output-data-dir-for_nkplogs/`+file+"?generatedownloads=true").pipe(
    )
  }

  getOutputDownloadLinks(link): string {
    //http://localhost:8080/search/api/admin/v7.0/files/download-path/b8dbeb7a5617a33e168a6d5a1cb26c2b
    return this.baseUrl +"/files/download-path/"+ link;
  }

  //deprecated (use getImportFiles instead)
  getConvertAndImportNdkInputDirFiles(): Observable<any> {
    return this.get(`/files/input-data-dir-for_convert-and-import-ndk/`);
  }

  getPidlistDirFiles(): Observable<any> {
    return this.get(`/files/pidlist-dir/`);
  }

  getConditions(): Observable<any> {
    return this.get('/rights/criteria');
  }


  getRights(pid: string): Observable<Right[]> {
    return this.get('/rights', { pids: pid }).pipe(map(response =>
      Right.fromJsonArray(response)));
  }

  updateRight(right: Right): Observable<Right> {
    return this.put(`/rights/${right.id}`, right.toJson()).pipe(map(response =>
      Right.fromJson(response)));
  }

  createRight(right: Right): Observable<Right> {
    return this.post(`/rights`, right.toJson()).pipe(map(response =>
      Right.fromJson(response)));
  }

  removeRight(right: Right): Observable<any> {
    return this.delete(`/rights/${right.id}`);
  }

  getConditionParams(): Observable<ConditionParam[]> {
    return this.get('/rights/params').pipe(map(response =>
      ConditionParam.fromJsonArray(response)));
  }

  createConditionParam(param: ConditionParam): Observable<ConditionParam> {
    return this.post(`/rights/params`, param.toJson()).pipe(map(response =>
      ConditionParam.fromJson(response)));
  }

  updateConditionParam(param: ConditionParam): Observable<ConditionParam> {
    return this.put(`/rights/params/${param.id}`, param.toJson()).pipe(map(response =>
      ConditionParam.fromJson(response)));
  }

  removeConditionParam(param: ConditionParam): Observable<any> {
    return this.delete(`/rights/params/${param.id}`);
  }

  getRoles(): Observable<Role[]> {
    return this.get('/roles').pipe(map(response =>
      Role.fromJsonArray(response)));
  }

  createRole(role: Role): Observable<Role> {
    return this.post(`/roles`, role.toJson()).pipe(map(response =>
      Role.fromJson(response)));
  }

  updateRole(role: Role): Observable<Role> {
    return this.put(`/roles/${role.id}`, role.toJson()).pipe(map(response =>
      Role.fromJson(response)));
  }

  removeRole(role: Role): Observable<any> {
    return this.delete(`/roles/${role.id}`);
  }

  getActions(pid: String): Observable<any> {
    return this.get(`/rights/actions?pid=${pid}`).pipe(map(response =>
      RightAction.fromJsonArray(response)));
  }

  //admin/v7.0/config/{key}
  getConfigValue(key: string): Observable<string> {
    return this.get(`/config/${key}`).pipe(map(response => response as string));
  }

  getConfigKeys(prefix: string): Observable<string[]> {
    return this.get(`/config/keys/${prefix}`).pipe(
      map(response => response as string[])
    );
  }

  setConfigValue(key:string, value:string):Observable<string> {
//    return this.get(`admin/v7.0/config/${key}`).pipe(map(response => response as string));
    return this.put(`/config/${key}`, value).pipe(
      map(response => response as string)
    );
  }


  createLicense(license: License): Observable<License> {
    return this.post(`/licenses/local`, license.toJson()).pipe(map(response =>
      License.fromJson(response)));
  }

  getAllLicenses(): Observable<License[]> {
    return this.get('/licenses').pipe(map(response =>
      License.fromJsonArray(response)));
  }

  getGlobalLicenses(): Observable<License[]> {
    return this.get('/licenses/global').pipe(map(response =>
      License.fromJsonArray(response)));
  }

  getLocalLicenses(): Observable<License[]> {
    return this.get('/licenses/local').pipe(map(response =>
      License.fromJsonArray(response)));
  }


  getLicensesOfObject(pid: string) {
    return this.get(`/items/${pid}/licenses`)
    //.pipe(delay(3000));
  }

  updateLocalLicense(license: License): Observable<License> {
    let url = `/licenses/local/${license.id}`;
    return this.put(`/licenses/local/${license.id}`, license.toJson()).pipe(map(response =>
      License.fromJson(response)));
  }

  moveLicenseUp(license: License): Observable<any> {
    return this.put(`/licenses/moveup/${license.id}`, license.toJson());
  }

  moveLicenseDown(license: License): Observable<any> {
    return this.put(`/licenses/movedown/${license.id}`, license.toJson());
  }

  removeLicense(license: License): Observable<any> {
    return this.delete(`/licenses/local/${license.id}`);
  }

  changeLicenseOrdering(licenses: License[]) {
    let licensesJS = licenses.map(l=> l.toJson());
    let json =  {
      licenses: licensesJS
    };

    return this.put(`/licenses/changeOrdering`, json);
  }

  changeOrdering(parent:string, items:string[]): Observable<any> {
    let json =  {
      childrenPids: items
    };
    let url = `/items/${parent}/children_order`;
    return this.put(url, json);
  }

  /** Statistiky  */
  statisticsLicenseFilter(dateFrom: string, dateTo: string, license: string, identifier: string): Observable<any> {
    let params: HttpParams = new HttpParams();
    if (dateFrom) {
      params = params.set('dateFrom', dateFrom);
    }
    if (dateTo) {
      params = params.set('dateTo', dateTo);
    }
    if (license) {
      params = params.set('license', license);
    }
    if (identifier) {
      params = params.set('identifier', identifier);
    }
    return this.get(`/statistics/license/options`, params);
  }

  statisticsModels(dateFrom: string, dateTo: string, license: string, identifier: string): Observable<any> {
    let params: HttpParams = new HttpParams();
    if (dateFrom) {
      params = params.set('dateFrom', dateFrom);
    }
    if (dateTo) {
      params = params.set('dateTo', dateTo);
    }
    if (license) {
      params = params.set('license', license);
    }
    if (identifier) {
      params = params.set('identifier', identifier);
    }
    return this.get(`/statistics/multimodel`, params);
  }

  statisticsLang(dateFrom: string, dateTo: string, license: string, identifier: string): Observable<any> {
    let params: HttpParams = new HttpParams();
    if (dateFrom) {
      params = params.set('dateFrom', dateFrom);
    }
    if (dateTo) {
      params = params.set('dateTo', dateTo);
    }
    if (license) {
      params = params.set('license', license);
    }
    if (identifier) {
      params = params.set('identifier', identifier);
    }

    return this.get(`/statistics/lang`, params);
  }

  statisticsAuthors(dateFrom: string, dateTo: string, license: string, identifier: string): Observable<any> {
    let params: HttpParams = new HttpParams();
    if (dateFrom) {
      params = params.set('dateFrom', dateFrom);
    }
    if (dateTo) {
      params = params.set('dateTo', dateTo);
    }
    if (license) {
      params = params.set('license', license);
    }
    if (identifier) {
      params = params.set('identifier', identifier);
    }
    return this.get(`/statistics/author`, params);
  }

  deleteStatistics(dateFrom: string, dateTo: string) {
    let params: HttpParams = new HttpParams();
    if (dateFrom) {
      params = params.set('dateFrom', dateFrom);
    }
    if (dateTo) {
      params = params.set('dateTo', dateTo);
    }

    const options = {
      params: params
    };
    return this.delete(`/statistics/`, options);
  }


  /** Specific for processes */
  /** flag_to_license process */
  getConfFlagToLicense() {
    return this.get(`/conf/flagtolicense`)
  }

  /* IIIF Support */

  /**  Parse client url and returns pid of object and bounding box */
  parseClientUrl(inputUrl: string): { uuid: string, bb: string } | null {
    const uuidRegex = /uuid:([a-fA-F0-9-]+)\?/;
    const bbRegex = /bb=([^&]+)/;

    const uuidMatch = inputUrl.match(uuidRegex);
    const bbMatch = inputUrl.match(bbRegex);

    if (uuidMatch && bbMatch) {
        const uuid = uuidMatch[1];
        const bb = bbMatch[1];

        return { "uuid":"uuid:"+uuid, "bb":bb };
    }
    return null;
  }

  /** Returns true if given url is clip url */
  isClipUrl(url:string): boolean {
    
    if (url?.startsWith('http')) {
      const coreUrlCompoents = new URL(this.appSettings.coreBaseUrl);
      const urlComponents = new URL(url);
      if (coreUrlCompoents.host === urlComponents.host ) {
        let struct = this.parseClientUrl(url);
        if (struct != null) {
          let retflag =  struct != null;
          return retflag;
        } else if (url.match(/iiif/)) {
          return true;
        }
      }
    }
    return false;
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

