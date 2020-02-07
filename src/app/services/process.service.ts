import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Filters } from '../components/processes/filters';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProcessService {

  //apiBaseUrl = 'http://localhost:3000';
  //apiBaseUrl = 'http://digitallibrary.cz:3000'; 
  //apiBaseUrl = 'http://localhost:8080/search/api/v6.0';
  apiBaseUrl = 'https://kramerius.dev.digitallibrary.cz/search/api/v6.0';
  processes: Object[];

  constructor(private http: HttpClient) { }

  //https://github.com/ceskaexpedice/kramerius/blob/b7b173c3d664d4982483131ff6a547f49d96f47e/common/src/main/java/cz/incad/kramerius/processes/States.java
  getStateName(value: number): any {
    switch (value) {
      case 0: return "NOT_RUNNING"; //TODO: tenhle nedava smysl, jaky je rozdil oproti PLANNED?
      case 1: return "RUNNING";
      case 2: return "FINISHED";
      case 3: return "FAILED";
      case 4: return "KILLED";
      case 5: return "PLANNED";
      case 6: return "BATCH_STARTED"; //depredated
      case 7: return "BATCH_FAILED"; //deprecated
      case 8: return "BATCH_FINISHED"; //deprecated
      case 9: return "WARNING"; //TODO: to tu imho taky nepatří, má být FINISHED
      default: return value;
    }
  }

  toProcessStatusCode(processState: string): number {
    switch (processState) {
      case "NOT_RUNNING": return 0; //TODO: tenhle nedava smysl, jaky je rozdil oproti PLANNED?
      case "RUNNING": return 1;
      case "FINISHED": return 2;
      case "FAILED": return 3;
      case "KILLED": return 4;
      case "PLANNED": return;
      case "BATCH_STARTED": return 6; //depredated
      case "BATCH_FAILED": return 7; //deprecated
      case "BATCH_FINISHED": return 8; //deprecated
      case "WARNING": return 9; //TODO: to tu imho taky nepatří, má být FINISHED
    }
  }

  processCanBeDeleted(processState: string) {
    //return [2, 3, 4, 7, 8, 9].includes(processStatusCode);
    return [2, 3, 4, 7, 8, 9].includes(this.toProcessStatusCode(processState));
  }

  processCanBeCanceled(processState: string) {
    return [1, 5].includes(this.toProcessStatusCode(processState));
  }

  processLogsAvailable(processState: string) {
    return [1, 2, 3, 4, 6, 7, 8, 9].includes(this.toProcessStatusCode(processState));
  }

  isSuccess(processState: string) {
    return [2, 8].includes(this.toProcessStatusCode(processState));
  }

  isWarning(processState: string) {
    return [9].includes(this.toProcessStatusCode(processState));
  }

  isDanger(processState: string) {
    return [3, 4, 7, 8].includes(this.toProcessStatusCode(processState));
  }

  /*
  getNumberOfProcesses(): Observable<number> {
    return this.http
      .get(this.baseUrl + '/processes-info')
      .pipe(map(response => {
        //[{"count":"125828"}]
        return response[0].count;
      }));
  }
  */

  getProcesses(offset: number, limit: number, filters: Filters): Observable<Object[]> {
    var reqParams = new HttpParams();
    //offset
    if (offset != null) {
      reqParams = reqParams.append('offset', '' + offset);
    }
    //limit
    if (limit != null) {
      reqParams = reqParams.append('limit', '' + limit);
    }
    if (!!filters) {
      //from
      if (!!filters.from) {
        reqParams = reqParams.append('from', this.dateToISOLikeButLocal(filters.from));
      }
      //until
      if (!!filters.until) {
        reqParams = reqParams.append('until', this.dateToISOLikeButLocal(filters.until));
      }
      //state
      if (!!filters.state) {
        reqParams = reqParams.append('state', filters.state);
      }
      //owner
      if (!!filters.owner) {
        reqParams = reqParams.append('owner', filters.owner);
      }
    }

    return this.http
      .get<Object[]>(this.apiBaseUrl + '/processes/batches',
        {
          params: reqParams
        }
      )
    /*.pipe(tap(response => {
      const updated = this.updateItems(response.slice())
      console.log('updated: ')
      console.log(updated)
    }))
    */
  }

  scheduleProcess(definition): Observable<any> {
    const login = "TODO:login";
    const password = "TODO:password";
    return this.http
      .post<any>(this.apiBaseUrl + '/processes',
        definition, {
        headers: new HttpHeaders({
          'Authorization': 'Basic ' + btoa(`${login}:${password}`)
        })
      })
      .pipe(
        tap(response => {
          //console.log(response)
        }))
  }

  updateItems(items: Object[]) {
    const data = items.slice();
    const updated = []
    for (const key in data) {
      var item = data[key];
      //replace defid with def
      item['def'] = item['defid'];
      delete item['defid'];
      //replace status (number) with state (string)
      item['state'] = this.statusToState(item['status']);
      delete item['status'];
      //replace batch_status (number) with batchState (string)
      item['batchState'] = this.batchStatusToBatchState(item['batch_status']);
      delete item['batch_status'];
      //replace loginname with userid
      item['userid'] = item['loginname'];
      delete item['loginname'];
      //replace firstname with userFirstname
      item['userFirstname'] = item['firstname'];
      delete item['firstname'];
      //replace surname with userSurname
      item['userSurname'] = item['surname'];
      delete item['surname'];

      //moving unused stuff into object "other"
      const other = {}
      item['other'] = other;
      //token
      other['token'] = item['token'];
      delete item['token'];
      //params
      other['params'] = item['params'];
      delete item['params'];
      //startedby
      other['startedby'] = item['startedby'];
      delete item['startedby'];
      //process_id
      other['process_id'] = item['process_id'];
      delete item['process_id'];
      //user_key
      other['user_key'] = item['user_key'];
      delete item['user_key'];
      //params_mapping
      other['params_mapping'] = item['params_mapping'];
      delete item['params_mapping'];
      //token_active
      other['token_active'] = item['token_active'];
      delete item['token_active'];
      //auth_token
      other['auth_token'] = item['auth_token'];
      delete item['auth_token'];
      //ip_addr
      other['ip_addr'] = item['ip_addr'];
      delete item['ip_addr'];

      updated.push(item)
    }
    return updated[0];
  }

  //https://github.com/ceskaexpedice/kramerius/blob/b7b173c3d664d4982483131ff6a547f49d96f47e/common/src/main/java/cz/incad/kramerius/processes/States.java
  statusToState(status: number): string {
    switch (status) {
      case 0: return "NOT_RUNNING"; //TODO: tenhle nedava smysl, jaky je rozdil oproti PLANNED?
      case 1: return "RUNNING";
      case 2: return "FINISHED";
      case 3: return "FAILED";
      case 4: return "KILLED";
      case 5: return "PLANNED";
      case 6: return "BATCH_STARTED"; //depredated
      case 7: return "BATCH_FAILED"; //deprecated
      case 8: return "BATCH_FINISHED"; //deprecated
      case 9: return "WARNING"; //TODO: to tu imho taky nepatří, má být FINISHED
      default: return "";
    }
  }

  //https://github.com/ceskaexpedice/kramerius/blob/b7b173c3d664d4982483131ff6a547f49d96f47e/common/src/main/java/cz/incad/kramerius/processes/BatchStates.java
  batchStatusToBatchState(status: number): string {
    switch (status) {
      case 0: return "NO_BATCH";
      case 1: return "BATCH_STARTED";
      case 2: return "BATCH_FAILED";
      case 3: return "BATCH_FINISHED";
      case 4: return "BATCH_WARNING";
      default: return "";
    }
  }

  dateToISOLikeButLocal(date) {
    const offsetMs = date.getTimezoneOffset() * 60 * 1000;
    const msLocal = date.getTime() - offsetMs;
    const dateLocal = new Date(msLocal);
    const iso = dateLocal.toISOString();
    const isoLocal = iso.slice(0, 19);
    return isoLocal;
  }

}
