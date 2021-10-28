import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppSettings } from './app-settings';
import { Batch } from '../models/batch.model';
import { delay, map, tap } from 'rxjs/operators';
import { ProcessOwner } from '../models/process-owner.model';
import { Process } from '../models/process.model';
import { Collection } from '../models/collection.model';

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

  private post(path: string, body, options = {}): Observable<Object> {
    return this.http.post(this.baseUrl + path, body, options);
  }

  private delete(path: string): Observable<Object> {
    return this.http.delete(this.baseUrl + path, {});
  }

  private put(path: string, body: any, options: any = {}): Observable<Object> {
    return this.http.put(this.baseUrl + path, body, options);
  }

  getGeneralQuery(path: string): Observable<any> {
    const options = { headers: new HttpHeaders({ 'Accept': '*' }) };
    return this.http.get(this.baseUrl + path, options);
    //return this.get(path);
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
      //delay(3000),
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

  createCollection(collection: Collection): Observable<any> {
    const payload = {
      name_cze: collection.name_cze,
      name_eng: collection.name_eng,
      description_cze: collection.description_cze,
      description_eng: collection.description_eng,
      content_cze: collection.content_cze,
      content_eng: collection.content_eng,
      standalone: collection.standalone
    }
    return this.post(`/collections`, payload);
  }

  getCollections(): Observable<any> {
    //TODO: offset, limit
    return this.get(`/collections`);
  }

  getCollectionsContainingItem(itemPid: String) {
    return this.get(`/collections?withItem=${itemPid}`);
  }

  getCollection(id: string): Observable<any> {
    return this.get(`/collections/${id}`);
  }

  updateCollection(collection: Collection): Observable<any> {
    const payload = {
      name_cze: collection.name_cze,
      name_eng: collection.name_eng,
      description_cze: collection.description_cze,
      description_eng: collection.description_eng,
      content_cze: collection.content_cze,
      content_eng: collection.content_eng,
      standalone: collection.standalone
    }
    return this.put(`/collections/${collection.id}`, payload);
  }

  deleteCollection(id: string): Observable<any> {
    return this.delete(`/collections/${id}`);
  }

  addItemToCollection(collectionPid: string, itemPid: string): Observable<Object> {
    return this.post(`/collections/${collectionPid}/items`, itemPid);
  }

  removeItemFromCollection(collectionPid: string, itemPid: string): Observable<Object> {
    return this.delete(`/collections/${collectionPid}/items/${itemPid}`);
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

  getImportFoxmlInputDirFiles(): Observable<any> {
    return this.get(`/files/input-data-dir-for_import-foxml/`);
  }

  getConvertAndImportNdkInputDirFiles(): Observable<any> {
    return this.get(`/files/input-data-dir-for_convert-and-import-ndk/`);
  }

  getPidlistDirFiles(): Observable<any> {
    return this.get(`/files/pidlist-dir/`);
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

