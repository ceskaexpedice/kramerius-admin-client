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
  selectedModel = undefined;

  stateFilter = 'all';

  objectsByModel: { pid: string, title: string, indexed: boolean }[] = [];
  objectsByModelFiltered: { pid: string, title: string, indexed: boolean }[] = [];

  constructor(private adminApi: AdminApiService, private clientApi: ClientApiService, private uiService: UIService, private appSettings: AppSettings, private dialog: MatDialog) { }

  ngOnInit() {
    if (this.appSettings.devMode) {
      this.selectedModel = 'periodical'
      this.fetchObjectsByModel();
    }
  }

  fetchObjectsByModel() {
    let fromRepository = this.adminApi.getObjectsByModel(this.selectedModel, 'ASC');
    let fromIndex = this.clientApi.getObjectsByModelFromIndex(this.selectedModel);
    forkJoin([fromRepository, fromIndex]).subscribe(result => {
      let objectsByModel: { pid: string, title: string, indexed: boolean }[] = [];
      const pidsInIndex = result[1];
      result[0]['items'].forEach(item => {
        objectsByModel.push({
          pid: item['pid'],
          title: item['title'],
          indexed: pidsInIndex.indexOf(item['pid']) != -1
        });
      });
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

  onSelectModel(event: MatSelectChange) {
    console.log(event)
    if (event.value) {
      this.fetchObjectsByModel();
    }
  }

  onChangeStateFilter(event) {
    this.stateFilter = event;
    this.filterObjectsByState();
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
          }
        }
        this.adminApi.scheduleProcess(params).subscribe(response => {
          this.uiService.showInfoSnackBar(`Indexace ${object.title} byla naplánována`);
        });
      }
    });
  }

  //TODO: deprecated, maybe usefull for some testing
  scheduleIndexationsOfAllObjectsByModel() {
    this.adminApi.getObjectsByModel(this.selectedModel).subscribe(response => {
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

  scheduleIndexationsByModel() {
    const max = 10;
    const size = this.objectsByModelFiltered.length;
    const processed = Math.min(size, max);
    const data: SimpleDialogData = {
      title: "Indexace objektů podle modelu",
      message: `Určitě chcete spusit úplnou indexaci prvních ${processed} z celkových ${size} objektů?`,
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
        this.objectsByModelFiltered.slice(0, processed).forEach(object => {
          requests.push(
            this.adminApi.scheduleProcess({
              defid: 'new_indexer',
              params: {
                type: 'TREE_AND_FOSTER_TREES',
                pid: object.pid,
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

}
