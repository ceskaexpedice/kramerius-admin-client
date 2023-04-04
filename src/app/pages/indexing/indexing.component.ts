import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { forkJoin } from 'rxjs';
import { ScheduleIndexationByModelDialogComponent } from 'src/app/dialogs/schedule-indexation-by-model-dialog/schedule-indexation-by-model-dialog.component';
import { ScheduleIndexationByPidDialogComponent } from 'src/app/dialogs/schedule-indexation-by-pid-dialog/schedule-indexation-by-pid-dialog.component';
import { ScheduleIndexationsByMultiplePidsDialogComponent } from 'src/app/dialogs/schedule-indexations-by-multiple-pids-dialog/schedule-indexations-by-multiple-pids-dialog.component';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { AppSettings } from 'src/app/services/app-settings';
import { ClientApiService } from 'src/app/services/client-api.service';
import { UIService } from 'src/app/services/ui.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-indexing',
  templateUrl: './indexing.component.html',
  styleUrls: ['./indexing.component.scss']
})
export class IndexingComponent implements OnInit {

  //Indexační procesy (všechny objekty v modelu)
  models = ['archive', 'graphic', 'sheetmusic', 'convolute', 'map', 'monograph', 'periodical', 'manuscript', 'collection', 'soundrecording'];
  modelNames = ['Archiválie', 'Grafiky', 'Hudebniny', 'Konvoluty', 'Mapy', 'Monografie', 'Periodika', 'Rukopisy', 'Sbírky', 'Zvukové nahrávky'];

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

  view: string;
  
  displayedColumns = ['select', 'pid', 'title', 'indexerVersion'];
  @ViewChild(MatSort) sort: MatSort;
  dataSource = new MatTableDataSource(this.itemsLoaded);;
  selection = new SelectionModel<any>(true, []);
  
  constructor(
    private adminApi: AdminApiService,
    private clientApi: ClientApiService,
    private appSettings: AppSettings,
    private dialog: MatDialog,
    private ui: UIService,
    private local: LocalStorageService,
    private router: Router
  ) { }

  ngOnInit() {
    this.view = this.local.getStringProperty('indexing.view', 'object');

    this.clientApi.getInfo().subscribe(data => {
      this.currentIndexerVersion = data.indexerVersion;
      this.loading = false;
    });
    if (this.appSettings.devMode) {
      this.loadFirstBatchOfItems();
    }
  }

  onSelectModel(event: MatSelectChange) {
    this.stateFilter = 'all';
    if (event.value) {
      this.loadFirstBatchOfItems();
    }
  }

  onChangeStateFilter(event) {
    this.stateFilter = event;
    this.loadFirstBatchOfItems();
  }

  buildUserClientUrl(pid: string) {
    return this.appSettings.userClientBaseUrl + "/uuid/" + pid;
  }

  openIndexationByPidDialog(object: { pid: string, title: string } = null) {
    const dialogRef = this.dialog.open(ScheduleIndexationByPidDialogComponent, {
      data: object,
      width: '600px',
      panelClass: 'app-schedule-indexation-by-pid-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'scheduled') {
        this.ui.showInfoSnackBar(`snackbar.success.scheduleIndexationByPid`);
      } else if (result === 'error') {
        this.ui.showErrorSnackBar(`snackbar.error.scheduleIndexationByPid`)
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar('snackbar.error.indexObjectWithProces')
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else if (result == 1) {
        this.ui.showInfoSnackBar(`snackbar.success.indexObjectWithProces.1`);
      } else if (result == 2 || result == 3 || result == 4) {
        this.ui.showInfoSnackBar('snackbar.success.indexObjectWithProces.2-4', {value: result});
      } else {
        this.ui.showInfoSnackBar('snackbar.success.indexObjectWithProces.more', {value: result});
      }
    });
  };

  openIndexationByModelDialog() {
    const dialogRef = this.dialog.open(ScheduleIndexationByModelDialogComponent, { 
      data: { model: this.selectedModel, modelName: this.modelNames[this.models.indexOf(this.selectedModel)] },
      width: '600px',
      panelClass: 'app-schedule-indexation-by-model-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      const modelTitle = this.modelNames[this.models.indexOf(this.selectedModel)] + " (model:" + this.selectedModel + ")";
      if (result === 'scheduled') {
        this.ui.showInfoSnackBar('snackbar.success.scheduleIndexationByModel', {value: modelTitle}, 3000);
      } else if (result === 'error') {
        this.ui.showErrorSnackBar('snackbar.error.scheduleIndexationByModel', {value: modelTitle})
      }
    });
  }

  openIndexationsByMultiplePidsDialog() {
    const items = this.getCurrentItems();
    const dialogRef = this.dialog.open(ScheduleIndexationsByMultiplePidsDialogComponent, { 
      data: items.length,
      width: '600px',
      panelClass: 'app-schedule-indexations-by-multiple-pids-dialog'
    });
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
          this.ui.showInfoSnackBar('snackbar.success.scheduleIndexationsByMultiplePids', {value: result.length}, 3000);
          this.scheduledIndexationsCounter = 0;
          this.loading = false;
        }, error => {
          this.loading = false;
          this.ui.showErrorSnackBar('snackbar.error.scheduleIndexationsByMultiplePids')
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
          
          this.dataSource = new MatTableDataSource(this.itemsLoaded);
          this.dataSource.sort = this.sort;
          //load more data
          if (this.itemsLoaded.length < this.itemsToShow) {
            this.loadMoreItemsForBatch();
          } else {
            this.loading = false;
          }
        }, error => {
          this.ui.showErrorSnackBar('nackbar.error.loadMoreItemsForBatch');
          this.loading = false;
        });
      }
    }, error => {
      this.ui.showErrorSnackBar('snackbar.error.loadMoreItemsForBatch');
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
  
  changeView(view: string) {
    this.view = view;
    this.local.setStringProperty('indexing.view', view);
    this.router.navigate(['/indexing/', view]);
  }

  // Whether the number of selected elements matches the total number of rows
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  // Selects all rows if they are not all selected; otherwise clear selection.
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

  // The label for the checkbox on the passed row
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }
}
