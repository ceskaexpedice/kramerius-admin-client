import { stringify } from '@angular/compiler/src/util';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSelectChange } from '@angular/material';
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
  models = ['monograph', 'periodical', 'graphic', 'map', 'archive', 'collection', 'sheetmusic', 'soundrecording', 'manuscript'];
  modelNames = ['Monografie', 'Periodika', 'Grafiky', 'Mapy', 'Archiválie', 'Sbírky', 'Hudebniny', 'Zvukové nahrávky', 'Rukopisy'];
  //selectedModel = 'monograph';
  selectedModel = undefined;

  stateFilter = 'not_indexed';
  //stateFilter = 'all';

  loading = false;

  itemsLoaded: { pid: string, title: string, indexed: boolean }[] = [];
  itemsToShowBatchSize = 100;
  itemsToShow = 0;

  repoLastOffset = 0;
  repoLimit = this.itemsToShowBatchSize;

  constructor(private adminApi: AdminApiService, private clientApi: ClientApiService, private uiService: UIService, private appSettings: AppSettings, private dialog: MatDialog) { }

  ngOnInit() {
    if (this.appSettings.devMode) {
      this.loadFirstBatchOfItems();
    }
  }

  onSelectModel(event: MatSelectChange) {
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
          defid: 'new_indexer',
          params: {
            type: this.selectedIndexationProcessType,
            pid: this.pidForIndexation,
            title: ""
          }
        }
        this.adminApi.scheduleProcess(params).subscribe(response => {
          this.uiService.showInfoSnackBar(`Indexace ${this.pidForIndexation} byla naplánována`);
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
          defid: 'new_indexer',
          params: {
            type: 'TREE_AND_FOSTER_TREES',
            pid: object.pid,
            title: object.title
          }
        }
        this.adminApi.scheduleProcess(params).subscribe(response => {
          this.uiService.showInfoSnackBar(`Indexace ${object.title} byla naplánována`);
        });
      }
    });
  }

  //TODO: deprecated, maybe usefull for some testing
  // scheduleIndexationsOfAllObjectsByModel() {
  //   this.adminApi.getObjectsByModel(this.selectedModel).subscribe(response => {
  //     response['items'].forEach(item => {
  //       const params = {
  //         defid: 'new_indexer',
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
        let requests = [];
        items.forEach(object => {
          requests.push(
            this.adminApi.scheduleProcess({
              defid: 'new_indexer',
              params: {
                type: 'TREE_AND_FOSTER_TREES',
                pid: object.pid,
                title: object.title,
              }
            })
          );
        })
        forkJoin(requests).subscribe(result => {
          this.uiService.showInfoSnackBar(`Bylo naplánováno ${result.length} indexací`);
        });
      }
    });
  }

  loadFirstBatchOfItems() {
    this.repoLastOffset = 0;
    this.itemsLoaded = [];
    this.itemsToShow = this.itemsToShowBatchSize;
    if (this.selectedModel) {
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
    //fetch items from repo by offset, limit
    this.adminApi.getObjectsByModel(this.selectedModel, 'ASC', this.repoLastOffset, this.repoLimit).subscribe(response => {
      const itemsFromRepo = response.items;
      let pidsFromRepo = [];
      itemsFromRepo.forEach(item => {
        pidsFromRepo.push(item.pid);
      });

      if (itemsFromRepo.length == 0) { //no more items in repo
        console.log('no more items in repo')
        this.loading = false;
      } else {
        this.repoLastOffset += pidsFromRepo.length;
        //check which of pids are in index
        this.clientApi.getPidsInIndex(pidsFromRepo).subscribe(pidsInIndex => {
          //merge to get final results
          let itemsMerged: { pid: string, title: string, indexed: boolean }[] = [];
          itemsFromRepo.forEach(item => {
            itemsMerged.push({
              pid: item['pid'],
              title: item['title'],
              indexed: pidsInIndex.indexOf(item['pid']) != -1
            });
          });

          //filter by states
          const filtered = itemsMerged.filter(o => {
            switch (this.stateFilter) {
              case 'all': return true;
              case 'indexed': return o.indexed;
              case 'not_indexed': return !o.indexed;
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
        });
      }
    });
  }

  getCurrentItems() {
    if (this.itemsToShow >= this.itemsLoaded.length) {
      return this.itemsLoaded;
    } else {
      return this.itemsLoaded.slice(0, this.itemsToShow);
    }
  }

}
