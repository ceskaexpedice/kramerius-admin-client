import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSelectChange } from '@angular/material';
import { forkJoin, Observable } from 'rxjs';
import { ScheduleIndexationByModelDialogComponent } from 'src/app/dialogs/schedule-indexation-by-model-dialog/schedule-indexation-by-model-dialog.component';
import { ScheduleIndexationByPidDialogComponent } from 'src/app/dialogs/schedule-indexation-by-pid-dialog/schedule-indexation-by-pid-dialog.component';
import { ScheduleIndexationsByMultiplePidsDialogComponent } from 'src/app/dialogs/schedule-indexations-by-multiple-pids-dialog/schedule-indexations-by-multiple-pids-dialog.component';
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

  //Indexační procesy (všechny objekty v modelu)
  models = ['archive', 'graphic', 'sheetmusic', 'map', 'monograph', 'periodical', 'manuscript', 'collection', 'soundrecording'];
  modelNames = ['Archiválie', 'Grafiky', 'Hudebniny', 'Mapy', 'Monografie', 'Periodika', 'Rukopisy', 'Sbírky', 'Zvukové nahrávky'];

  selectedModel = undefined;
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

  buildUserClinetUrl(pid: string) {
    return this.appSettings.userClientBaseUrl + "/uuid/" + pid;
  }

  openIndexationByPidDialog(object: { pid: string, title: string } = null) {
    const dialogRef = this.dialog.open(ScheduleIndexationByPidDialogComponent, { data: object });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'scheduled') {
        this.ui.showInfoSnackBar(`Indexace byla naplánována`);
      } else if (result === 'error') {
        this.ui.showErrorSnackBar("Nepodařilo se naplánovat indexaci")
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar("Nepodařilo se naplánovat proces(y) Indexace")
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else if (result == 1) {
        this.ui.showInfoSnackBar(`Proces Indexace byl naplánován`);
      } else if (result == 2 || result == 3 || result == 4) {
        this.ui.showInfoSnackBar(`Byly naplánovány ${result} procesy Indexace`);
      } else {
        this.ui.showInfoSnackBar(`Bylo naplánováno ${result} procesů Indexace`);
      }
    });
  };

  openIndexationByModelDialog() {
    const dialogRef = this.dialog.open(ScheduleIndexationByModelDialogComponent, { data: { model: this.selectedModel, modelName: this.modelNames[this.models.indexOf(this.selectedModel)] } });
    dialogRef.afterClosed().subscribe(result => {
      const modelTitle = this.modelNames[this.models.indexOf(this.selectedModel)] + " (model:" + this.selectedModel + ")";
      if (result === 'scheduled') {
        this.ui.showInfoSnackBar(`Indexace modelu ${modelTitle} byla naplánována`, 3000);
      } else if (result === 'error') {
        this.ui.showErrorSnackBar(`Nepodařilo se naplánovat indexaci modelu ${modelTitle}`)
      }
    });
  }

  openIndexationsByMultiplePidsDialog() {
    const items = this.getCurrentItems();
    const dialogRef = this.dialog.open(ScheduleIndexationsByMultiplePidsDialogComponent, { data: items.length });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'ignore_inconsistent_objects:true' || result === 'ignore_inconsistent_objects:false') {
        const ignoreInconsistentObjects = result === 'ignore_inconsistent_objects:true';
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
                ignoreInconsistentObjects: ignoreInconsistentObjects
              }
            }, () => this.scheduledIndexationsCounter++)
          );
        })
        forkJoin(requests).subscribe(result => {
          this.ui.showInfoSnackBar(`Bylo naplánováno ${result.length} indexací`, 3000);
          this.scheduledIndexationsCounter = 0;
          this.loading = false;
        }, error => {
          this.loading = false;
          this.ui.showErrorSnackBar("Nepodařilo se naplánovat indexace")
          console.log(error);
        });
      } else if (result === 'error' || result === 'cancel') {
        this.loading = false;
      }
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
    const order = 'ASC';
    //const order = 'DESC';
    const query = this.repoUseCursor ?
      this.adminApi.getObjectsByModelWithCursor(this.selectedModel, order, this.reponNextCursor, this.repoLimit) :
      this.adminApi.getObjectsByModel(this.selectedModel, order, this.repoNextOffset, this.repoLimit);
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
