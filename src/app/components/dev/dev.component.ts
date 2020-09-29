import { Component, OnInit } from '@angular/core';
import { CollectionsService } from 'src/app/services/collections.service';
import { Collection } from 'src/app/models/collection.model';
import { AdminApiService } from 'src/app/services/admin-api.service';

@Component({
  selector: 'app-dev',
  templateUrl: './dev.component.html',
  styleUrls: ['./dev.component.scss']
})
export class DevComponent implements OnInit {

  constructor(private collectionsService: CollectionsService, private adminApi: AdminApiService) { }

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


  //Indexační proces (jeden objekt)
  indexationProcessTypes = ['OBJECT', 'OBJECT_AND_CHILDREN', 'TREE']; //TODO: add all types
  selectedIndexationProcessType = this.indexationProcessTypes[0];
  pidForIndexation = this.item1;

  //Indexační proces (model)
  modelIndexationProcessModels = ['monograph', 'periodical', 'graphic', 'map', 'archive', 'collection', 'sheetmusic', 'soundrecording'];
  selectedModelIndexationProcessModel = this.modelIndexationProcessModels[0];

  //deletion
  pidForDeletion;


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

  deleteObjectFromRepo() {
    this.adminApi.deleteObject(this.pidForDeletion).subscribe(response => {
      console.log(`object ${this.pidForDeletion} deleted`)
    });
  }

  scheduleIndexationProcessesForAll() {
    //TODO: get all top-level objects from repository or rather from API (because indexation mustn't depend on index)
    //see https://app.gethido.com/p/posu5sqvet/tasks/24
    const knownObjects = [
      //MONOGRAFIE
      //m1_drobnustky
      "uuid:0eaa6730-9068-11dd-97de-000d606f5dc6",
      //m2_monograph_units
      "uuid:1ad9c320-8be5-11e7-927c-001018b5eb5c",
      //m3_katalog_vystavy_pdf_file
      "uuid:6c270600-d243-11ea-9c41-005056827e52",
      //m4_filosofie_rovnovahy_pdf_base64
      "uuid:4873e8c7-5967-4003-8544-96f64ca55da7",

      //PERIODIKA
      //p1_deutsche_nachrichten_no_ocr
      "uuid:af925a94-682c-4f18-9d25-0664c5d08dbb",
      //p2_lidovky_1941-1943
      "uuid:bdc405b0-e5f9-11dc-bfb2-000d606f5dc6",
      //p3_mitteilungs_blatt
      "uuid:8f6e74d2-4f32-46e5-9b41-bb96d68164f0",
      //p4_brnenske_noviny (no longer available in MZK)
      "uuid:a101de00-2119-11e3-a5bb-005056827e52",
      //p5_filosoficky_casopis_2015_pdf_clanky
      "uuid:c82a1017-48e1-11e1-9389-005056a60003",
      //p6_zvon
      "uuid:5d555200-8db0-11e3-bd09-005056827e51",

      //COLLECTIONS
      //c1_evropa
      "uuid:f478da13-33c2-4c5d-aab9-a7471b211a0a",
      //c2_cr
      "uuid:e7c94b4d-a980-4c40-9402-9c391806ea65",
      //c3_empty_test
      "uuid:c911e8b7-a2ec-4863-9a75-abad024dfe35",
      //test1
      "uuid:c911e8b7-a2ec-4863-9a75-abad024dfe35",
      //test2
      "uuid:c9ed9710-7d18-4680-8b96-3b9dd01a1822",

      //ARCHIVES
      //a1_avertissement
      "uuid:7b7223c8-510b-4a3c-91fa-1499fcd279f3",

      //GRAPHICS
      //g1_divadlo_v_kral_maste_plzni
      "uuid:3ea38826-01cb-4098-9994-6ffb3d4c8054",
      //g2_ceska_ulice_c3
      "uuid:9a7feaa4-32e3-4806-93a7-771611da9cbf",
      //g3_dlazba_kostela
      "uuid:ae7b3450-207c-409d-bf88-f60606f82b8f",
      //g4_chrlice_u_brna
      "uuid:61acc90c-52df-473b-8c2d-02adcaaf66e3",

      //MANUSCRIPTS
      //m1_erganzung_zur_gesinde_ordnung
      "uuid:770808d3-4c2c-4f95-8d32-996fd25e0e90",
      //m2_with_internal_part
      "uuid:dc8d1605-2791-45ec-abae-2049187e2357",

      //MAPS
      //m1_situations_plan_der_landeshauptstadt_brunn
      "uuid:093527ff-2652-433c-afe0-ed9c1d5a9eb8",
      //m2_geologicka_mapa_zem_i_koruny_ceske
      "uuid:3572124e-d1bd-4f4e-8dfb-b16045e8aa80",
      //m3_plan_velkeho_brna
      "uuid:ba4934d1-0a1e-4a01-a89d-c948477ca833",
      //m4_karte_von_ireland
      "uuid:0c5e9951-253e-4566-8c43-9599cfe0374e",
      //m5_kort_over_gronland
      "uuid:14ea9442-b077-46b3-a70e-dea858549a2e",
      //m6_general_carte_von_gross_britannien
      "uuid:8fe89821-9756-4b1b-b8fd-ab8521abdb5a",
      //m7_ceske_velnice
      "uuid:66146f27-8376-44f1-a8aa-b35b1e18fff7",
      //m8_cejkov1
      "uuid:2412ae3c-b785-4cb0-83ff-2896bf885c04",
      //m9_cejkov2
      "uuid:7abe3bfb-d094-4a27-a9d5-e1fe63be7a8b",

      //SHEETMUSIC
      //s1_quintetto_in_f
      "uuid:17fe155d-a975-11e0-a5e1-0050569d679d",

      //SOUNDRECORDING
      //s1_klavirni_skladby
      "uuid:fbf5efba-ff5f-4921-aee6-2d7f4141561b",
      //s2_zdravy_nemocny
      "uuid:1cc63251-50dc-4e5d-ae97-6a48ff38526c",
      //s3_bile_noci
      "uuid:b332069d-c5b0-47c9-8364-ee6094472814",
      //s4_a_letter_home
      "uuid:05452672-81f0-4121-b545-4572913b382e",
    ];

    knownObjects.forEach(pid => {
      const params = {
        defid: 'new_indexer',
        params: {
          type: 'TREE',
          pid: pid
        }
      }
      // this.pidForIndexation = null;
      this.adminApi.scheduleProcess(params).subscribe(response => {
        console.log('indexation scheduled for' + pid)
      });
    });
  }

}
