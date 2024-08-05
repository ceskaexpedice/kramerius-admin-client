import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ScheduleReHarvestSpecificPidsDialogComponent } from 'src/app/dialogs/schedule-re-harvest-specific-pids-dialog/schedule-re-harvest-specific-pids-dialog.component';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { Reharvest } from 'src/app/models/cdk.library.model';
import { AppSettings } from 'src/app/services/app-settings';
import { CdkApiService } from 'src/app/services/cdk-api.service';
import { UIService } from 'src/app/services/ui.service';

// --- data mock to delete ---
/*
export interface objectReharvest {
  date: string;
  pid: string;
  deleteObject: boolean;
  description: string;
  state: string;
}

const ELEMENT_DATA: objectReharvest[] = [
  {date: '20.4.2024', pid: 'uuid:3a99c250-bc5d-4318-a5a8-db00547fd5c4', deleteObject: true, description: 'Manualni reharvest objektu z MZK, KNAV', state: 'PLANNED'},
  {date: '24.4.2024', pid: 'uuid:c9b6c867-6d60-4a64-9519-95f5e66ea910', deleteObject: false, description: 'Neplanovany reharvest objektu z duvodu dila/stranky', state: 'FINISHED'},
  {date: '20.4.2024', pid: 'uuid:3a99c250-bc5d-4318-a5a8-db00547fd5c4', deleteObject: true, description: 'Manualni reharvest objektu z MZK, KNAV', state: 'PLANNED'},
  {date: '24.4.2024', pid: 'uuid:c9b6c867-6d60-4a64-9519-95f5e66ea910', deleteObject: false, description: 'Neplanovany reharvest objektu z duvodu dila/stranky', state: 'FINISHED'}
];
*/
// -- data mock to delete ---

@Component({
  selector: 'app-cdk-object-reharvest',
  templateUrl: './cdk-object-reharvest.component.html',
  styleUrls: ['./cdk-object-reharvest.component.scss']
})
export class CdkObjectReharvestComponent implements OnInit {

  displayedColumns: string[] = ['date', 'pid', 'libs', 'type', 'state', 'pod', 'description', 'approve', 'cancel', 'delete'];
  //dataSource = ELEMENT_DATA;

  dataSource:Reharvest[];
  //isReharvestFromCore: boolean = true;

  constructor(
    private dialog: MatDialog,
    private ui: UIService,
    private cdkApi: CdkApiService,
    private appSettings:AppSettings
  ) { }

  ngOnInit(): void {
    this.reloadReharvests();
  }


 reloadReharvests() {
  this.cdkApi.reharvests().subscribe(resp=> {
    this.dataSource = resp;
    this.dataSource.sort((a, b) => b.getDateTime().getTime() - a.getDateTime().getTime());
  });
 }

  isReharvestFromCore(reharvest:Reharvest) {
    return reharvest.name?.startsWith("Delete");
  }

  clientLink(uuid) {
    
    /*
    let kramInstance =  this.appSettings.coreBaseUrl+'/../uuid/';
    this.appSettings.getCoreInfo().subscribe(response => {
       let  coreInfo = response;
      if ( coreInfo?.instance?.client) {
          kramInstance = coreInfo.instance.client+"/uuid/";
      } 
    });
    return kramInstance+uuid;
    */

    return this.appSettings.userClientBaseUrl + "/uuid/" + uuid;
  }

 
  deleteRow(element) {
    const data: SimpleDialogData = {
      title: this.ui.getTranslation('modal.onRemoveCDKReharvest.title'),
      message: this.ui.getTranslation('modal.onRemoveCDKReharvest.message'),
      btn1: {
        label: this.ui.getTranslation('button.yes'),
        value: 'yes',
        color: 'warn'
      },
      btn2: {
        label: this.ui.getTranslation('button.no'),
        value: 'no',
        color: 'default'
      }
    };
    const dialogRef = this.dialog.open(SimpleDialogComponent, {
      data: data,
      width: '600px',
      panelClass: 'app-simple-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {

        this.cdkApi.deleteReharvest(element.id).subscribe(result => {
          this.reloadReharvests();
        });

      }
    });

  }

 /*

     this.kramInstance =  this.appSettings.coreBaseUrl+'/../uuid/';

    this.api.getSdntSyncInfo().subscribe((data:any)=> {
      this.info = data;

      this.appSettings.getCoreInfo().subscribe(response => {
        this.coreInfo = response;

        let sindex = this.info.endpoint.indexOf('/api/v1.0/lists/changes');
        if (sindex > -1) {
          this.sdnntInstance = this.info.endpoint.substring(0, sindex)+"/search";
        }

        if ( this.coreInfo?.instance?.client) {
          this.kramInstance = this.coreInfo.instance.client+"/uuid/";
        } else {
          if (this.info.version === 'v7') {
            let kindex = this.info.kramerius.indexOf('/search/api/client/v7.0');
            if (kindex > -1 && !this.info.kramerius.startsWith('http://localhost')) {
              this.kramInstance = this.info.kramerius.substring(0, kindex)+"/uuid/";
            }
          } else {
            let kindex = this.info.kramerius.indexOf('/search/api/v5.0');
            if (kindex > -1 && !this.info.kramerius.startsWith('http://localhost')) {
              this.kramInstance = this.info.kramerius.substring(0, kindex)+"/uuid/";
            }
          }
      }
    });

 */

 openScheduledReHarvestSpecificPidsDialog() {
  const dialogRef = this.dialog.open(ScheduleReHarvestSpecificPidsDialogComponent, {
    width: '600px',
    panelClass: 'app-schedule-re-harvest-specific-pids-dialog'
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result === 'error') {
      this.ui.showErrorSnackBar('snackbar.error.scheduleCDKHarvest')
    } else if (result === 'cancel' || result === undefined) {
      //nothing, dialog was closed
    } else {
      this.ui.showInfoSnackBar('snackbar.success.scheduleCDKHarvest');
    }
    this.cdkApi.reharvests().subscribe(resp=> {
      this.dataSource = resp;
      this.dataSource.sort((a, b) => b.getDateTime().getTime() - a.getDateTime().getTime());
    });

  })

  }

  approveState( reharvest: any) {
      this.cdkApi.changeReharvestState(reharvest.id, 'open').subscribe(x=> {
        this.cdkApi.reharvests().subscribe(resp=> {
          this.dataSource = resp;
          this.dataSource.sort((a, b) => b.getDateTime().getTime() - a.getDateTime().getTime());
        });
      });
  }

  closedState( reharvest: any) {
      this.cdkApi.changeReharvestState(reharvest.id, 'cancelled').subscribe(x=> {
        this.cdkApi.reharvests().subscribe(resp=> {
          this.dataSource = resp;
          this.dataSource.sort((a, b) => b.getDateTime().getTime() - a.getDateTime().getTime());
        });
      });
  }


}
