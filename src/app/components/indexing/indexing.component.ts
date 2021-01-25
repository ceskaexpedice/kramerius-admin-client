import { stringify } from '@angular/compiler/src/util';
import { Component, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material';
import { forkJoin, Observable } from 'rxjs';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { AppSettings } from 'src/app/services/app-settings';
import { ClientApiService } from 'src/app/services/client-api.service';
import { UIService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-indexing',
  templateUrl: './indexing.component.html',
  styleUrls: ['./indexing.component.scss']
})
export class IndexingComponent implements OnInit {

  //Indexační proces (jeden objekt)
  indexationProcessTypes = ['TREE_AND_FOSTER_TREES', 'OBJECT', 'OBJECT_AND_CHILDREN', 'TREE']; //TODO: add all types
  selectedIndexationProcessType = this.indexationProcessTypes[0];
  pidForIndexation;

  //Indexační procesy (všechny objekty v modelu)
  models = ['monograph', 'periodical', 'graphic', 'map', 'archive', 'collection', 'sheetmusic', 'soundrecording', 'manuscript'];
  modelNames = ['Monografie', 'Periodika', 'Grafiky', 'Mapy', 'Archiválie', 'Sbírky', 'Hudebniny', 'Zvukové nahrávky', 'Rukopisy'];
  selectedModelIndexationProcessModel = undefined;

  stateFilter = 'all';

  objectsByModel: { pid: string, title: string, indexed: boolean }[] = [];
  objectsByModelFiltered: { pid: string, title: string, indexed: boolean }[] = [];

  constructor(private adminApi: AdminApiService, private clientApi: ClientApiService, private uiService: UIService, private appSettings: AppSettings) { }

  ngOnInit() {
    //TODO: disable for production
    this.selectedModelIndexationProcessModel = this.models[0];
    this.fetchObjectsByModel();
  }

  scheduleIndexationProcess() {
    const params = {
      defid: 'new_indexer',
      params: {
        type: this.selectedIndexationProcessType,
        pid: this.pidForIndexation,
      }
    }
    this.adminApi.scheduleProcess(params).subscribe(response => {
      console.log('indexation scheduled for ' + this.pidForIndexation);
    });
  }

  scheduleModelIndexationProcesses() {
    this.adminApi.getObjectsByModel(this.selectedModelIndexationProcessModel).subscribe(response => {
      response['items'].forEach(item => {
        const params = {
          defid: 'new_indexer',
          params: {
            type: 'TREE_AND_FOSTER_TREES',
            pid: item.pid,
          }
        }
        this.adminApi.scheduleProcess(params).subscribe(response => {
          console.log('indexation scheduled for ' + this.pidForIndexation);
        });
      });
    });
  }

  fetchObjectsByModel() {
    let fromRepository = this.adminApi.getObjectsByModel(this.selectedModelIndexationProcessModel, 'ASC');
    let fromIndex = this.clientApi.getObjectsByModelFromIndex(this.selectedModelIndexationProcessModel);
    forkJoin([fromRepository, fromIndex]).subscribe(result => {
      //console.log(result)
      let objectsByModel: { pid: string, title: string, indexed: boolean }[] = [];
      const pidsInIndex = result[1];
      result[0]['items'].forEach(item => {
        objectsByModel.push({
          pid: item['pid'],
          title: item['title'],
          indexed: pidsInIndex.indexOf(item['pid']) != -1
        });
      });
      //console.log(objectsByModel)
      this.objectsByModel = objectsByModel
      this.filterObjectsByState();
    });
  }

  filterObjectsByState() {
    this.objectsByModelFiltered = this.objectsByModel.filter(o => {
      switch (this.stateFilter) {
        case 'all': return true;
        case 'indexed': return o.indexed;
        case 'not_indexed': return !o.indexed;
      }
    });
  }

  scheduleIndexation(object: { pid: string, title: string, indexed: boolean }) {
    this.uiService.showInfoSnackBar('TODO: naplánovat indexaci objektu s potvrzovacím dialogem a výběrem módu indexace');
  }

  onSelectModel(event: MatSelectChange) {
    console.log(event)
    if (event.value) {
      this.fetchObjectsByModel();
    }
  }

  onChangeStateFilter(event) {
    this.stateFilter = event;
    //this.fetchObjectsByModel();
    this.filterObjectsByState();
  }

  buildDigitalLibraryUrl(pid: string) {
    return this.appSettings.digitalLibraryBaseUrl + "/uuid/" + pid;
  }

}
