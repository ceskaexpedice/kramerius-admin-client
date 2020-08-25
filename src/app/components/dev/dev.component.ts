import { Component, OnInit } from '@angular/core';
import { CollectionsService } from 'src/app/services/collections.service';
import { Collection } from 'src/app/models/collection.model';

@Component({
  selector: 'app-dev',
  templateUrl: './dev.component.html',
  styleUrls: ['./dev.component.scss']
})
export class DevComponent implements OnInit {

  constructor(private collectionsService: CollectionsService) { }

  //collection1 = "uuid:bdd66da5-1833-4c88-b90f-7acb3695b8ec";//test
  //collection2 = "uuid:f478da13-33c2-4c5d-aab9-a7471b211a0a";//evropa
  //collection3 = "uuid:e7c94b4d-a980-4c40-9402-9c391806ea65";//cr
  //collections = [this.collection1,this.collection2,this.collection3,]

  item1 = "uuid:0eaa6730-9068-11dd-97de-000d606f5dc6";//drobnustky
  item2 = "uuid:ba4934d1-0a1e-4a01-a89d-c948477ca833";//plan velkeho brna
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

}
