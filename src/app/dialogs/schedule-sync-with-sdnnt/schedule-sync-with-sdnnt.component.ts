import { Component, OnInit } from '@angular/core';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { UIService } from 'src/app/services/ui.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SdnntItem, SdnntSync } from 'src/app/models/sdnnt.model';
import { PageEvent } from '@angular/material/paginator';


@Component({
  selector: 'app-schedule-sync-with-sdnnt',
  templateUrl: './schedule-sync-with-sdnnt.component.html',
  styleUrls: ['./schedule-sync-with-sdnnt.component.scss']
})
export class ScheduleSyncWithSdnntComponent implements OnInit {
  displayedColumns = ['pid','catalog', 'name', 'action'];
  dataSource = []; //ELEMENT_DATA;

  length = 50;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25];

  constructor(
    private api: AdminApiService,
    private ui: UIService

  ) { 


  }



  ngOnInit(): void {

        this.reloadData();
    
  }

  handlePageEvent(e: PageEvent) {
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.reloadData();
  }

  reloadData() {
    this.api.getSdntSyncData(this.pageSize,this.pageIndex).subscribe((data:SdnntSync) =>  {
      this.length = data.numberOfRec;
      this.dataSource = data.docs;
      console.log(this.dataSource.length)
    },  (error:HttpErrorResponse) => {
      console.log("error "+error);
      //this.errorState = true;
      //this.errorMessage = error.error.message;
    });
  }

  scheduleSync() {
    this.api.scheduleProcess({
      defid: 'sdnnt-sync',
      params: {
      }
    }).subscribe(response => {
      this.ui.showInfoSnackBar('snackbar.success.scheduleImportProcess');
    }, error => {
      this.ui.showInfoSnackBar('snackbar.error.scheduleImportProcess');
      console.log(error);
    });
  }

}

/*
{
        "id":"oai:aleph-nkp.cz:SKC01-000949099_1",
        "catalog":"oai:aleph-nkp.cz:SKC01-000949099",
        "title":"Morbus Kitahara / Christoph Ransmayr ; [z němčiny přeložila Jana Zoubková]",
        "type_of_rec":"BK",
        "state":"A",
        "fetched":"2023-04-11T08:56:38.773Z",
        "pid":"uuid:c960ddc0-c72a-11e4-af6e-005056827e51",
        "license":"dnnto",
        "type":"main",
        "real_kram_exists":true,
        "sync_actions":["add_dnnto"],
        "_version_":1762870111752945664}

        {
        "id":"oai:aleph-nkp.cz:SKC01-001009694_1",
        "catalog":"oai:aleph-nkp.cz:SKC01-001009694",
        "title":"Obejmi mě, lásko / Jennifer Blake ; [přeložila Lenka Tichá]",
        "type_of_rec":"BK",
        "state":"A",
        "fetched":"2023-04-11T08:56:38.773Z",
        "pid":"uuid:4ddf2470-380c-11e4-8e0d-005056827e51",
        "license":"dnntt",
        "type":"main",
        "real_kram_licenses":["dnnto"],
        "real_kram_exists":true,
        "sync_actions":["change_dnntt_dnnto"],
        "_version_":1762870111756091400},


        {
        "id":"oai:aleph-nkp.cz:SKC01-004170462_1",
        "catalog":"oai:aleph-nkp.cz:SKC01-004170462",
        "title":"Sanace dřevěných konstrukcí a staveb ... : odborný seminář : sborník odborných příspěvků",
        "type_of_rec":"SE",
        "state":"A",
        "fetched":"2023-04-11T09:32:18.025Z",
        "pid":"uuid:359c6770-e7bb-11e3-b72e-005056827e52",
        "license":"dnntt",
        "type":"main",
        "real_kram_licenses":["dnntt"],
        "real_kram_exists":true,
        "sync_actions":["partial_change"],
        "_version_":1762872514545975304},
  */

export interface PeriodicElement {
  id: string;
  catalog: string;
  title:string,
  type_of_rec:string;
  state: string;
  pid: string;
  license:string;
  type: string;
  real_kram_licenses:any;
  sync_actions:any; 
  children: any;
}

const ELEMENT_DATA: PeriodicElement[] = [

  {

    id:'oai:aleph-nkp.cz:SKC01-000949099_1',
    catalog:'oai:aleph-nkp.cz:SKC01-000084336', 
    title:'Morbus Kitahara / Christoph Ransmayr ; [z němčiny přeložila Jana Zoubková]',
    type_of_rec:"BK",
    state:'A',
    pid:"uuid:c960ddc0-c72a-11e4-af6e-005056827e51",
    license:"dnnto",
    type:"main",
    sync_actions:["add_dnnto"], 
    real_kram_licenses: null,
    children:[]
  },

  {
    id:"oai:aleph-nkp.cz:SKC01-001009694_1",
    catalog:"oai:aleph-nkp.cz:SKC01-001009694",
    title:"Obejmi mě, lásko / Jennifer Blake ; [přeložila Lenka Tichá]",
    type_of_rec:"BK",
    state:"A",
    pid:"uuid:4ddf2470-380c-11e4-8e0d-005056827e51",
    license:"dnntt",
    type:"main",
    real_kram_licenses:["dnnto"],
    sync_actions:["change_dnntt_dnnto"],
    children:[]
  },

  {
    id:"oai:aleph-nkp.cz:SKC01-004170462_1",
    catalog:"oai:aleph-nkp.cz:SKC01-004170462",
    title:"Sanace dřevěných konstrukcí a staveb ... : odborný seminář : sborník odborných příspěvků",
    type_of_rec:"SE",
    state:"A",
    pid:"uuid:359c6770-e7bb-11e3-b72e-005056827e52",
    license:"dnntt",
    type:"main",
    real_kram_licenses:["dnntt"],
    sync_actions:["partial_change"],
    children:[
      {

          parent_id:"oai:aleph-nkp.cz:SKC01-004170462_1",
          state:"A",
          type:"granularity",
          pid:"uuid:82c58ee0-e7bc-11e3-adbd-5ef3fc9bb22f",
          id:"oai:aleph-nkp.cz:SKC01-004170462_1_uuid:82c58ee0-e7bc-11e3-adbd-5ef3fc9bb22f",
          license:"dnntt",
          real_kram_licenses:["dnnto"],
          sync_actions:["change_dnntt_dnnto"]
      }


    ]
  }


];
  

