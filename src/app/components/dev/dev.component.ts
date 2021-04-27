import { Component, OnInit } from '@angular/core';
import { CollectionsService } from 'src/app/services/collections.service';
import { Collection } from 'src/app/models/collection.model';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { ClientApiService } from 'src/app/services/client-api.service';
import { MatDialog } from '@angular/material';
import { ScheduleIndexationByPidDialogComponent } from 'src/app/dialogs/schedule-indexation-by-pid-dialog/schedule-indexation-by-pid-dialog.component';
import { UIService } from 'src/app/services/ui.service';
import { ScheduleChangeVisibilityByPidlDialogComponent } from 'src/app/dialogs/schedule-change-visibility-by-pidl-dialog/schedule-change-visibility-by-pidl-dialog.component';

@Component({
  selector: 'app-dev',
  templateUrl: './dev.component.html',
  styleUrls: ['./dev.component.scss']
})
export class DevComponent implements OnInit {

  //Sbirky

  //collection1 = "uuid:bdd66da5-1833-4c88-b90f-7acb3695b8ec";//test
  //collection2 = "uuid:f478da13-33c2-4c5d-aab9-a7471b211a0a";//evropa
  //collection3 = "uuid:e7c94b4d-a980-4c40-9402-9c391806ea65";//cr
  //collections = [this.collection1,this.collection2,this.collection3,]

  item1 = "uuid:0c5e9951-253e-4566-8c43-9599cfe0374e";//drobnustky
  item2 = "uuid:9960a459-46a8-4508-90ac-ae01d5651c03";//plan velkeho brna
  item3 = "uuid:fbf5efba-ff5f-4921-aee6-2d7f4141561b"; //klavirni skladby
  item4 = "uuid:b7a9bc7f-db16-403b-8358-78f9c12cd817"; //Chybna indexace - level 1
  item5 = "uuid:e1d36b93-4152-4c50-89b8-a8871ee6c390"; //Chybna indexace - level 2

  item1Title = "drobnustky";
  item2Title = "plan velkeho brna";
  item3Title = "klavirni skladby";
  item4Title = "Chybna indexace - level 1";
  item5Title = "Chybna indexace - level 2";

  items = [
    // this.item1, 
    // this.item2, 
    this.item3,
    this.item4,
    this.item5,

  ]
  titles = [
    // this.item1Title, 
    // this.item2Title, 
    this.item3Title,
    this.item4Title,
    this.item5Title,
  ]

  collections;
  collections_by_id;
  pids_of_collections_having_item;
  pids_of_collections_missing_item;


  //deletion
  pidForDeletion;

  pidForPrintFoxml;
  pidForPrintSolr;

  constructor(
    private collectionsService: CollectionsService,
    private adminApi: AdminApiService,
    private clientApi: ClientApiService,
    private dialog: MatDialog,
    private ui: UIService
  ) { }


  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.pids_of_collections_having_item = {}
    this.pids_of_collections_missing_item = {}
    this.collections_by_id = {};
    this.collectionsService.getCollections(0, 100).subscribe(([collections, count]: [Collection[], number]) => {
      collections.forEach(collection => {
        this.collections_by_id[collection.id] = collection;
      });
      this.collections = collections;
      //console.log(collections);
      this.items.forEach(item => {
        //console.log(item);
        this.collectionsService.getCollectionsContainingItem(item).subscribe(([collectionsWithItem, count]: [Collection[], number]) => {
          //console.log("collections of " + item);
          //console.log(collectionsWithItem);
          this.pids_of_collections_having_item[item] = [];
          collectionsWithItem.forEach(collection => {
            this.pids_of_collections_having_item[item].push(collection.id);
          });
          this.pids_of_collections_missing_item[item] = [];
          this.collections.forEach(collection => {
            if (this.pids_of_collections_having_item[item].indexOf(collection.id) == -1) {
              this.pids_of_collections_missing_item[item].push(collection.id);
            }
          });
        });
      });
    });
  }

  logData() {
    console.log("collections having item:")
    console.log(this.pids_of_collections_having_item);
    console.log("collections missing item:")
    console.log(this.pids_of_collections_missing_item);
  }

  removeFromCollection(item_id: string, collection_id: string) {
    //console.log(item_id)
    //console.log(collection_id)
    this.collectionsService.removeItemFromCollection(collection_id, item_id).subscribe(result => {
      console.log(result);
      (async () => {
        await this.delay(0);
        this.loadData();
      })();
    });
  }

  addToCollection(item_id: string, collection_id: string) {
    //console.log(item_id)
    //console.log(collection_id)
    //console.log("dev.component: adding item " + item_id + " to collection " + collection_id)
    this.collectionsService.addItemToCollection(collection_id, item_id).subscribe(result => {
      console.log(result);
      (async () => {
        await this.delay(0);
        this.loadData();
      })();
    });
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  deleteObjectFromRepo() {
    this.adminApi.deleteObject(this.pidForDeletion).subscribe(response => {
      console.log(`object ${this.pidForDeletion} deleted`)
    });
  }

  printFoxmlOfObjectFromRepo() {
    const query = `/items/${this.pidForPrintFoxml}/foxml`
    this.adminApi.getGeneralQuery(query).subscribe(response => {
      console.log(response);
    })
  }

  printSolrRecord() {
    this.clientApi.getObjectByPidFromIndex(this.pidForPrintSolr).subscribe(response => {
      console.log(response);
    })
  }

  logDataFromAdminApi() {
    const pid = "uuid:51f84b60-5542-11e9-8854-005056827e51"
    //const query = `/items/${pid}/foxml`
    //const query = `/items?model=monograph&order=ASC&offset=0&limit=10`
    const query = `/items?model=monograph&order=ASC&cursor=*&limit=10`
    this.adminApi.getGeneralQuery(query).subscribe(response => {
      console.log(response);
    })
  }

  logDataFromClientApi() {
    //const query = `/items/${pid}/foxml`
    const pid = "uuid:51f84b60-5542-11e9-8854-005056827e51"
    const query = `/items/${pid}/info/structure`
    this.clientApi.getGeneralQuery(query).subscribe(response => {
      console.log(response);
    })
  }

}
