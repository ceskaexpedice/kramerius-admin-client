import { Component, OnInit } from '@angular/core';
import { CollectionsService } from 'src/app/services/collections.service';
import { Collection } from 'src/app/models/collection.model';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { ClientApiService } from 'src/app/services/client-api.service';
import { MatDialog } from '@angular/material/dialog';
import { UIService } from 'src/app/services/ui.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatTooltipModule
  ],
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

  collections: any[];
  collections_by_id: { [x: string]: Collection; };
  pids_of_collections_having_item: any;
  pids_of_collections_missing_item: any;

  changeThumbnailSrcPid: string;
  changeThumbnailTrgPid: string;

  //deletion
  pidForDeletion: string;

  pidForPrintFoxml: any;
  pidForPrintSolr: string;

  //set MODS
  setModsPid: string;
  setModsMods: string;

  //export PDF
  pidForPdfExport: any;

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
    this.collectionsService.getCollections('cze',0, 100).subscribe(([collections, count]: [Collection[], number]) => {
      collections.forEach(collection => {
        this.collections_by_id[collection.id] = collection;
      });
      this.collections = collections;
      //console.log(collections);
      this.items.forEach(item => {
        //console.log(item);
        this.collectionsService.getCollectionsContainingItem('cze',item).subscribe(([collectionsWithItem, count]: [Collection[], number]) => {
          //console.log("collections of " + item);
          //console.log(collectionsWithItem);
          this.pids_of_collections_having_item[item] = [];
          collectionsWithItem.forEach(collection => {
            this.pids_of_collections_having_item[item].push(collection.id);
          });
          this.pids_of_collections_missing_item[item] = [];
          this.collections.forEach((collection: { id: any; }) => {
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

  deleteObjectLowLevel() {
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

  testAction() {
    //vrati globalne dostupne licence
    // const query = `/licenses/items/${pid}/info/structure`
    // const query = `/licenses`
    // this.adminApi.getGeneralQuery(query).subscribe(response => {
    //   console.log(response);
    // })

    //vrati licence konkretniho objektu
    // const pid = "uuid:17fe155d-a975-11e0-a5e1-0050569d679d"
    // const query = `/items/${pid}/licenses`
    // this.adminApi.getGeneralQuery(query).subscribe(response => {
    //   console.log(response);
    // })

    // //nastaveni poradi deti
    // this.adminApi.setChildrenOrder("uuid:17fe155d-a975-11e0-a5e1-0050569d679d",
    //   [
    //     "uuid:19603d70-a975-11e0-a5e1-0050569d679d", //third
    //     "uuid:18b5cc9f-a975-11e0-a5e1-0050569d679d", //second
    //     "uuid:17fed8ae-a975-11e0-a5e1-0050569d679d", //first
    //     //"uuid:19603d7x-a975-11e0-a5e1-0050569d679d", //not there
    //   ]
    // ).subscribe(response => {
    //   console.log(response);
    // })


    //add items to collection
    const collectionPid = 'uuid:94387274-3e5f-43b0-b9bb-7f5afc4190d0';
    const itemsPids = [
      //'blabla', //neplatny PID
      //'uuid:94387274-3e5f-43b0-b9bb-7f5afc4190d0', //sbirka samotna
      'uuid:94387274-3e5f-xxxx-b9bb-7f5afc4190d0', //neexistujici objekt
      'uuid:834e7040-6a1b-11dd-9dfc-000d606f5dc6', //ok
      //'uuid:ac050110-6a2b-11dd-b783-000d606f5dc6', //ok
      'uuid:83474450-6a1b-11dd-9876-000d606f5dc6' //ok
    ];
    this.adminApi.addItemsToCollection(collectionPid, itemsPids)
      .subscribe(response => {
        console.log('add item: ok: ' + response)
      }, response => { //error
        console.log('add item: error: ' + response)
      });

    //addItemToCollection
    // this.adminApi.addItemToCollection(collectionPid, itemsPids[0])
    // .subscribe(response => {
    //   console.log('add item: ok: ' + response)
    // }, response => { //error
    //   console.log('add item:  error: ' + response)
    // });

    // const pid = "uuid:d4978b50-8dc3-11e7-aac2-5ef3fc9bb22f";
    // const query = `/items/${pid}/streams/BIBLIO_MODS`
    // //const query = `/items/${pid}/streams/DC`
    // this.adminApi.getGeneralQuery(query).subscribe(response => {
    //   console.log(response);
    // })

    // this.adminApi.scheduleProcess({
    //   defid: 'add_license',
    //   //defid: 'remove_license',
    //   params: {
    //     //license: 'public_domain',
    //     license: 'blabla',
    //     pid: 'uuid:61acc90c-52df-473b-8c2d-02adcaaf66e3'
    //   }
    // }).subscribe(response => {
    //   console.log(response);
    // }, error => {
    //   console.log(error);
    // });

    // this.adminApi.getPidlistDirFiles().subscribe(response => {
    //   console.log(response);
    // });
  }

  changeThubnail() {
    //const monPid = "uuid:1ad9c320-8be5-11e7-927c-001018b5eb5c";
    //const pagePid = "uuid:d4978b50-8dc3-11e7-aac2-5ef3fc9bb22f"; //control group E, URL
    //const pagePid = "uuid:4a7c2e50-af36-11dd-9643-000d606f5dc6" //control group M
    //TODO: control group R
    //lidovky
    //const pagePid = "uuid:95d42670-6e84-11dd-a1d2-000d606f5dc6"//1. issue rocnik 50
    //const pagePid = "uuid:8247fcc0-6a1b-11dd-b8b3-000d606f5dc6";//1. issue rocnik 51
    //const monPid = "uuid:bdc405b0-e5f9-11dc-bfb2-000d606f5dc6";
    //drobnustky
    //const pagePid = "uuid:4a79bd50-af36-11dd-a60c-000d606f5dc6"
    //const monPid = "uuid:0eaa6730-9068-11dd-97de-000d606f5dc6";

    this.adminApi.setThumbFromPage(this.changeThumbnailTrgPid, this.changeThumbnailSrcPid).subscribe(result => {
      console.log(result);
      this.changeThumbnailSrcPid = undefined;
      this.changeThumbnailTrgPid = undefined;
    });
  }

  setMods() {
    this.adminApi.setMods(this.setModsPid, this.setModsMods).subscribe(result => {
      console.log(result);
      this.setModsPid = undefined;
      this.setModsMods = undefined;
    });
  }

  exportPDF() {
    console.log('TODO: exportPDF');
  }

}
