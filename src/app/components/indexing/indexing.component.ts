import { Component, OnInit } from '@angular/core';
import { AdminApiService } from 'src/app/services/admin-api.service';

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
  modelIndexationProcessModels = ['monograph', 'periodical', 'graphic', 'map', 'archive', 'collection', 'sheetmusic', 'soundrecording', 'manuscript'];
  selectedModelIndexationProcessModel = this.modelIndexationProcessModels[0];

  constructor(private adminApi: AdminApiService) { }

  ngOnInit() {
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
      //console.log(response);
      response['items'].forEach(pid => {
        const params = {
          defid: 'new_indexer',
          params: {
            type: 'TREE',
            pid: pid,
          }
        }
        this.adminApi.scheduleProcess(params).subscribe(response => {
          console.log('indexation scheduled for ' + this.pidForIndexation);
        });
      });
    });
  }

}
