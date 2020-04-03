import { Component, OnInit } from '@angular/core';
import { CollectionsService } from 'src/app/services/collections.service';

@Component({
  selector: 'app-dev',
  templateUrl: './dev.component.html',
  styleUrls: ['./dev.component.scss']
})
export class DevComponent implements OnInit {

  constructor(private collectionsService: CollectionsService) { }

  ngOnInit() {
  }

  addToCollection() {
    const collectionPid = "uuid:bdd66da5-1833-4c88-b90f-7acb3695b8ec";
    //const itemPid = "uuid:0eaa6730-9068-11dd-97de-000d606f5dc6"; //drobnustky
    const itemPid = "uuid:fbf5efba-ff5f-4921-aee6-2d7f4141561b"; //drobnustky

    
    this.collectionsService.addItemToCollection(collectionPid, itemPid).subscribe(result => {
      console.log(result);
    });
  }

}
