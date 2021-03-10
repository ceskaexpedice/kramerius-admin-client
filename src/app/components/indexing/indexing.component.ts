import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSelectChange } from '@angular/material';
import { error } from 'protractor';
import { forkJoin, Observable } from 'rxjs';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
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
  models = ['archive', 'graphic', 'sheetmusic', 'map', 'monograph', 'periodical', 'manuscript', 'collection', 'soundrecording'];
  modelNames = ['Archiválie', 'Grafiky', 'Hudebniny', 'Mapy', 'Monografie', 'Periodika', 'Rukopisy', 'Sbírky', 'Zvukové nahrávky'];

  selectedModel = 'monograph';
  //selectedModel = undefined;

  //stateFilter = 'not_indexed';
  //stateFilter = 'all';
  stateFilter = undefined;

  loading = false;

  currentIndexerVersion;

  itemsLoaded: { pid: string, title: string, indexed: boolean, indexerVersion: number, indexationInProgress: boolean }[] = [];
  itemsToShowBatchSize = 100;
  itemsToShow = 0;

  repoUseCursor = true;
  repoNextOffset = 0;
  reponNextCursor = '*';
  repoLimit = this.itemsToShowBatchSize;

  scheduledIndexationsCounter = 0;

  constructor(
    private adminApi: AdminApiService,
    private clientApi: ClientApiService,
    private uiService: UIService,
    private appSettings: AppSettings,
    private dialog: MatDialog,
    private ui: UIService
  ) { }

  ngOnInit() {
    this.clientApi.getInfo().subscribe(data => {
      this.currentIndexerVersion = data.indexerVersion;
      this.loading = false;
    });
    if (this.appSettings.devMode) {
      this.loadFirstBatchOfItems();
    }
  }

  onSelectModel(event: MatSelectChange) {
    this.stateFilter = undefined;
    if (event.value) {
      this.loadFirstBatchOfItems();
    }
  }

  onChangeStateFilter(event) {
    this.stateFilter = event;
    this.loadFirstBatchOfItems();
  }

  buildDigitalLibraryUrl(pid: string) {
    return this.appSettings.digitalLibraryBaseUrl + "/uuid/" + pid;
  }

  scheduleIndexationByPid() {
    const data: SimpleDialogData = {
      title: "Indexace objektu",
      message: `Určitě chcete spusit indexaci ${this.pidForIndexation} v režimu  ${this.selectedIndexationProcessType}?`,
      btn1: {
        label: 'Ano',
        value: 'yes',
        color: 'warn'
      },
      btn2: {
        label: 'Ne',
        value: 'no',
        color: 'default'
      }
    };
    const dialogRef = this.dialog.open(SimpleDialogComponent, { data: data });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        const params = {
          defid: 'new_indexer_index_object',
          params: {
            type: this.selectedIndexationProcessType,
            pid: this.pidForIndexation,
            title: ""
          }
        }
        this.adminApi.scheduleProcess(params).subscribe(response => {
          this.uiService.showInfoSnackBar(`Indexace ${this.pidForIndexation} byla naplánována`);
        }, error => {
          this.ui.showErrorSnackBar("Nepodařilo se naplánovat indexaci")
        });
      }
    });
  }

  scheduleFullIndexation(object: { pid: string, title: string, indexed: boolean }) {
    const data: SimpleDialogData = {
      title: "Indexace objektu",
      message: `Určitě chcete spusit úplnou indexaci ${object.title}?`,
      btn1: {
        label: 'Ano',
        value: 'yes',
        color: 'warn'
      },
      btn2: {
        label: 'Ne',
        value: 'no',
        color: 'default'
      }
    };
    const dialogRef = this.dialog.open(SimpleDialogComponent, { data: data });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        const params = {
          defid: 'new_indexer_index_object',
          params: {
            type: 'TREE_AND_FOSTER_TREES',
            pid: object.pid,
            title: object.title
          }
        }
        this.adminApi.scheduleProcess(params).subscribe(response => {
          this.uiService.showInfoSnackBar(`Indexace ${object.title} byla naplánována`);
        }, error => {
          this.ui.showErrorSnackBar("Nepodařilo se naplánovat indexaci")
        });
      }
    });
  }

  //TODO: deprecated, maybe usefull for some testing
  // scheduleIndexationsOfAllObjectsByModel() {
  //   this.adminApi.getObjectsByModel(this.selectedModel).subscribe(response => {
  //     response['items'].forEach(item => {
  //       const params = {
  //         defid: 'new_indexer_index_object',
  //         params: {
  //           type: 'TREE_AND_FOSTER_TREES',
  //           pid: item.pid,
  //           title: ""
  //         }
  //       }
  //       this.adminApi.scheduleProcess(params).subscribe(response => {
  //         console.log('indexation scheduled for ' + this.pidForIndexation);
  //       });
  //     });
  //   });
  // }

  scheduleIndexationsOfCurrentItems() {
    const items = this.getCurrentItems();
    const data: SimpleDialogData = {
      title: "Indexace objektů podle modelu",
      message: `Určitě chcete spusit úplnou indexaci všech ${items.length} načtených objektů?`,
      btn1: {
        label: 'Ano',
        value: 'yes',
        color: 'warn'
      },
      btn2: {
        label: 'Ne',
        value: 'no',
        color: 'default'
      }
    };
    const dialogRef = this.dialog.open(SimpleDialogComponent, { data: data });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.loading = true;
        let requests = [];
        items.forEach(object => {
          requests.push(
            this.adminApi.scheduleProcess({
              defid: 'new_indexer_index_object',
              params: {
                type: 'TREE_AND_FOSTER_TREES',
                pid: object.pid,
                title: object.title,
              }
            }, () => this.scheduledIndexationsCounter++)
          );
        })
        forkJoin(requests).subscribe(result => {
          this.uiService.showInfoSnackBar(`Bylo naplánováno ${result.length} indexací`);
          this.scheduledIndexationsCounter = 0;
          this.loading = false;
        }, error => {
          this.loading = false;
          this.ui.showErrorSnackBar("Nepodařilo se naplánovat indexace")
          console.log(error);
        });
      }
    });
  }

  scheduleIndexationsOfModel() {
    //TODO: parametry co indexovat
    const params = {
      defid: 'new_indexer_index_model',
      params: {
        type: 'TREE_AND_FOSTER_TREES',
        pid: 'model:' + this.selectedModel,
        indexNotIndexed: true,
        indexRunningOrError: false,
        indexIndexed: false,
        indexIndexedOutdated: false,
      }
    }
    const modelTitle = this.modelNames[this.models.indexOf(this.selectedModel)] + " (model:" + this.selectedModel + ")";
    this.adminApi.scheduleProcess(params).subscribe(response => {
      this.uiService.showInfoSnackBar(`Indexace modelu ${modelTitle} byla naplánována`, 3000);
    }, error => {
      this.ui.showErrorSnackBar(`Nepodařilo se naplánovat indexaci modelu ${modelTitle}`)
    });
  }

  loadFirstBatchOfItems() {
    this.reponNextCursor = '*';
    this.repoNextOffset = 0;
    this.itemsLoaded = [];
    this.itemsToShow = this.itemsToShowBatchSize;
    if (this.selectedModel && this.stateFilter) {
      this.loadMoreItemsForBatch();
    }
  }

  loadNextBatchOfItems() {
    if (this.selectedModel) {
      this.itemsToShow += this.itemsToShowBatchSize;
      this.loadMoreItemsForBatch();
    }
  }

  loadMoreItemsForBatch() {
    this.loading = true;
    //fetch items from repo by offset/cursor & limit
    const query = this.repoUseCursor ?
      this.adminApi.getObjectsByModelWithCursor(this.selectedModel, 'ASC', this.reponNextCursor, this.repoLimit) :
      this.adminApi.getObjectsByModel(this.selectedModel, 'ASC', this.repoNextOffset, this.repoLimit);
    query.subscribe(response => {
      const itemsFromRepo = response.items;
      let pidsFromRepo = [];
      itemsFromRepo.forEach(item => {
        pidsFromRepo.push(item.pid);
      });

      if (itemsFromRepo.length == 0) { //no more items in repo
        console.log('no more items in repo')
        this.loading = false;
      } else {
        this.repoNextOffset += pidsFromRepo.length;
        this.reponNextCursor = response.nextCursor;
        //check which of pids are in index
        this.clientApi.getIndexationInfoForPids(pidsFromRepo).subscribe(objectsInIndex => {
          const objectsInIndexByPid = {};
          objectsInIndex.forEach(object => {
            objectsInIndexByPid[object.pid] = object;
          })
          //merge to get final results
          let itemsMerged: { pid: string, title: string, indexed: boolean, indexerVersion: number, indexationInProgress: boolean }[] = [];
          itemsFromRepo.forEach(item => {
            const objectInIndex = objectsInIndexByPid[item.pid];
            itemsMerged.push({
              pid: item['pid'],
              title: item['title'],
              indexed: objectInIndex && !objectInIndex['full_indexation_in_progress'],
              indexationInProgress: objectInIndex && objectInIndex['full_indexation_in_progress'],
              indexerVersion: objectInIndex ? (objectInIndex['indexer_version'] ? +objectInIndex['indexer_version'] : 0) : undefined,
            });
          });

          //filter by states
          const filtered = itemsMerged.filter(o => {
            switch (this.stateFilter) {
              case 'all': return true;
              case 'in_progress': return o.indexationInProgress;
              case 'not_indexed': return !o.indexed && !o.indexationInProgress;
              case 'indexed_old': return o.indexed && o.indexerVersion != this.currentIndexerVersion;
              case 'indexed_current': return o.indexed && o.indexerVersion == this.currentIndexerVersion;
            }
          });
          //push
          this.itemsLoaded.push(...filtered);
          //load more data
          if (this.itemsLoaded.length < this.itemsToShow) {
            this.loadMoreItemsForBatch();
          } else {
            this.loading = false;
          }
        }, error => {
          this.ui.showErrorSnackBar("Nepodařilo se načíst data")
          this.loading = false;
        });
      }
    }, error => {
      this.ui.showErrorSnackBar("Nepodařilo se načíst data")
      this.loading = false;
    });
  }

  getCurrentItems() {
    if (this.itemsToShow >= this.itemsLoaded.length) {
      return this.itemsLoaded;
    } else {
      return this.itemsLoaded.slice(0, this.itemsToShow);
    }
  }

  noCurrentItems() {
    return this.getCurrentItems().length == 0;
  }

}
