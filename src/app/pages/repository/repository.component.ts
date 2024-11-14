import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DeleteStatisticsDialogComponent } from 'src/app/dialogs/delete-statistics-dialog/delete-statistics-dialog.component';
import { GenerateNkpLogsDialogComponent } from 'src/app/dialogs/generate-nkp-logs-dialog/generate-nkp-logs-dialog.component';
import { ScheduleAddLicenseDialogComponent } from 'src/app/dialogs/schedule-add-license-dialog/schedule-add-license-dialog.component';
import { ScheduleChangePolicyByPidDialogComponent } from 'src/app/dialogs/schedule-change-policy-by-pid-dialog/schedule-change-policy-by-pid-dialog.component';
import { ScheduleImportFoxmlDialogComponent } from 'src/app/dialogs/schedule-import-foxml-dialog/schedule-import-foxml-dialog.component';
import { ScheduleImportNdkDialogComponent } from 'src/app/dialogs/schedule-import-ndk-dialog/schedule-import-ndk-dialog.component';
import { ScheduleProcessingIndexRebuildDialogComponent } from 'src/app/dialogs/schedule-processing-index-rebuild-dialog/schedule-processing-index-rebuild-dialog.component';
import { ScheduleProcessingIndexRebuildForObjectDialogComponent } from 'src/app/dialogs/schedule-processing-index-rebuild-for-object-dialog/schedule-processing-index-rebuild-for-object-dialog.component';
import { ScheduleRemoveLicenseDialogComponent } from 'src/app/dialogs/schedule-remove-license-dialog/schedule-remove-license-dialog.component';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { UIService } from 'src/app/services/ui.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { DeleteObjectsLowLevelDialogComponent } from 'src/app/dialogs/delete-objects-low-level-dialog/delete-objects-low-level-dialog.component';
import { ScheduleDeleteObjectsSmartComponent } from 'src/app/dialogs/schedule-delete-objects-smart/schedule-delete-objects-smart.component';
import { AuthService } from 'src/app/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { ScheduleSyncWithSdnntComponent } from 'src/app/dialogs/schedule-sync-with-sdnnt/schedule-sync-with-sdnnt.component';
import { ScheduleStartTheSdnntReviewProcessComponent } from 'src/app/dialogs/schedule-start-the-sdnnt-review-process/schedule-start-the-sdnnt-review-process.component';
import { ScheduleChangeFlagOnLicenseDialogComponent } from 'src/app/dialogs/schedule-change-flag-on-license-dialog/schedule-change-flag-on-license-dialog.component';
import { ScheduleRemoveTheVisibilityFlagDialogComponent } from 'src/app/dialogs/schedule-remove-the-visibility-flag-dialog/schedule-remove-the-visibility-flag-dialog.component';
import { AppSettings } from 'src/app/services/app-settings';
import { ScheduleReHarvestSpecificPidsDialogComponent } from 'src/app/dialogs/schedule-re-harvest-specific-pids-dialog/schedule-re-harvest-specific-pids-dialog.component';
import { ScheduleMigrateCollectionsDialogComponent } from 'src/app/dialogs/schedule-migrate-collections-dialog/schedule-migrate-collections-dialog.component';
import { EditSetDialogComponent } from 'src/app/dialogs/edit-set-dialog/edit-set-dialog.component';
import { AddNewSetDialogComponent } from 'src/app/dialogs/add-new-set-dialog/add-new-set-dialog.component';
import { OAISet } from 'src/app/models/oaiset';
import { OAIApiService } from 'src/app/services/oai-api.services';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from 'ngx-flexible-layout';
import { MatTabsModule } from '@angular/material/tabs';

import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FlexLayoutModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatTabsModule, MatFormFieldModule, MatInputModule,
    MatTooltipModule, MatDividerModule
  ],
  selector: 'app-repository',
  templateUrl: './repository.component.html',
  styleUrls: ['./repository.component.scss']
})
export class RepositoryComponent implements OnInit {
  view: string;
  //implicitSetHasChanged: boolean = false;

  // // to test accesibility
  notAllowed: boolean = true;

  sets: Record<string, OAISet> = {};

  defaultSet:OAISet = null;
  deafultSetQuery = "";



  constructor(
    private dialog: MatDialog,
    private ui: UIService,
    private adminApi: AdminApiService,
    private oaiApi: OAIApiService,
    private auth: AuthService,
    private local: LocalStorageService,
    private router: Router,
    public settings: AppSettings
  ) { }


  ngOnInit() {
    this.view = this.router.url.replace('/repository/', '');
    this.reloadOAI();
  }

  reloadOAI() {
    this.adminApi.getConfigKeys('oai.set.').subscribe(k=> {

      k.forEach(oneKey=>  {
        const restkey =  oneKey.replace('oai.set.', ''); 
        const[id, property] = restkey.split('.');
        
        if (id === 'DEFAULT') {
          if (this.defaultSet == null) {
            this.defaultSet = new OAISet('DEFAULT', '', '','');

            this.oaiApi.info('DEFAULT').subscribe(json=>{
              this.defaultSet.numberDocs = json['numberDocs']
            });

          }

          let nameProp =  `oai.set.${id}.name`;
          let descProp =  `oai.set.${id}.description`;
          let filterProp =  `oai.set.${id}.filter`;
      
          const object = {
            [nameProp]: "",
            [descProp]: "",
            [filterProp]: "",
          };

          this.adminApi.getConfigProperties(object).subscribe(props=> {
            if (props[nameProp]) {
              this.defaultSet.setName = props[nameProp]
            }

            if (props[descProp]) {
              this.defaultSet.setDescription = props[descProp];
              
            }
            if (props[filterProp]) {
              this.defaultSet.filterQuery = props[filterProp];
              this.deafultSetQuery = props[filterProp];
            }

          });
          /*
          this.adminApi.getConfigValue(oneKey).subscribe(oneVal=> {
            if (property === 'name') {
              this.defaultSet.setName = oneVal[oneKey]
            } else if (property === 'description') {
              this.defaultSet.setDescription = oneVal[oneKey];
            } else if (property === 'desc') {
              this.sets[id].setDescription = oneVal[oneKey];
            } else if (property === 'filter') {
              this.defaultSet.filterQuery = oneVal[oneKey];
              this.deafultSetQuery = oneVal[oneKey];
            }
        });*/

        } else {

          if (!this.sets[id]) {
            this.sets[id] = new OAISet(id, '', '','');
            this.oaiApi.info(id).subscribe(json=>{
              this.sets[id].numberDocs = json['numberDocs']
            });
          }

          
          let nameProp =  `oai.set.${id}.name`;
          let descProp =  `oai.set.${id}.description`;
          let filterProp =  `oai.set.${id}.filter`;
      
          const object = {
            [nameProp]: "",
            [descProp]: "",
            [filterProp]: "",
          };

          this.adminApi.getConfigProperties(object).subscribe(props=> {
            if (props[nameProp]) {
              this.sets[id].setName = props[nameProp]
            }

            if (props[descProp]) {
              this.sets[id].setDescription = props[descProp];
              
            }
            if (props[filterProp]) {
              this.sets[id].filterQuery = props[filterProp];
            }
          });

          /*
          this.adminApi.getConfigValue(oneKey).subscribe(oneVal=> {
              if (property === 'name') {
                this.sets[id].setName = oneVal[oneKey]
              } else if (property === 'description') {
                this.sets[id].setDescription = oneVal[oneKey];
              } else if (property === 'desc') {
                this.sets[id].setDescription = oneVal[oneKey];
              } else if (property === 'filter') {
                this.sets[id].filterQuery = oneVal[oneKey];
              }
          });*/
  
  
        }

      });
    });
  }

  getOAISets() {

    let sets: OAISet[] = [];
    Object.keys(this.sets).sort((a, b) => {
      return a.localeCompare(b);
    }).forEach(key=> {
      sets.push(this.sets[key]);
    });
    
    return sets;
  }




  openscheduleProcessingIndexRebuildDialog() {
    const dialogRef = this.dialog.open(ScheduleProcessingIndexRebuildDialogComponent, {
      width: '600px',
      panelClass: 'app-schedule-processing-index-rebuild-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar('snackbar.error.scheduleProcessingIndexRebuild');
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else {
        this.ui.showInfoSnackBar('snackbar.success.scheduleProcessingIndexRebuild');
      }
    });
  };

  openscheduleProcessingIndexRebuildForPidDialog() {
    const dialogRef = this.dialog.open(ScheduleProcessingIndexRebuildForObjectDialogComponent, {
      width: '600px',
      panelClass: 'app-schedule-processing-index-for-object-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar('snackbar.error.scheduleProcessingIndexRebuildForObject');
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else {
        this.ui.showInfoSnackBar('snackbar.success.scheduleProcessingIndexRebuildForObject');
      }
    });
  };

  openScheduleImportFoxmlDialog() {
    const dialogRef = this.dialog.open(ScheduleImportFoxmlDialogComponent, {
      width: '600px',
      panelClass: 'app-schedule-import-foxml-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar("Nepodařilo se naplánovat proces Import FOXML")
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else {
        this.ui.showInfoSnackBar(`Proces Import FOXML byl naplánován`);
      }
    });
  }

  openChangePolicyDialog() {
    const dialogRef = this.dialog.open(ScheduleChangePolicyByPidDialogComponent, {
      width: '600px',
      panelClass: 'app-schedule-change-policy-by-pid-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar('snackbar.error.scheduleChangePolicyByPid')
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else if (result == 1) {
        this.ui.showInfoSnackBar('snackbar.success.scheduleChangePolicyByPid.1');
      } else if (result == 2 || result == 3 || result == 4) {
        this.ui.showInfoSnackBar('snackbar.success.scheduleChangePolicyByPid.2-4', {value: result});
      } else {
        this.ui.showInfoSnackBar('snackbar.success.scheduleChangePolicyByPid.more', {value: result});
      }
    });
  };

  openScheduleImportNdkDialog() {
    const dialogRef = this.dialog.open(ScheduleImportNdkDialogComponent, {
      width: '600px',
      panelClass: 'app-schedule-import-Ndk-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar("Nepodařilo se naplánovat proces Import NDK METS")
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else {
        this.ui.showInfoSnackBar(`Proces Import NDK METS byl naplánován`);
      }
    });
  }

  openAddLicenceDialog() {
    const dialogRef = this.dialog.open(ScheduleAddLicenseDialogComponent, {
      width: '600px',
      panelClass: 'app-schedule-add-licencse-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar('snackbar.error.scheduleAddLicense')
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else {
        this.ui.showInfoSnackBar('snackbar.success.scheduleAddLicense');
      }
    });
  }

  openRemoveLicenceDialog() {
    const dialogRef = this.dialog.open(ScheduleRemoveLicenseDialogComponent, {
      width: '600px',
      panelClass: 'app-schedule-remove-license--dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar('snackbar.error.scheduleRemoveLicense')
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else {
        this.ui.showInfoSnackBar('snackbar.success.scheduleRemoveLicense');
      }
    });
  }


  todo() {
    console.log('TODO: implement');
  }

  allowedGlobalAction(name:string) {
    if (this.auth.authorizedGlobalActions) {
      let retval = this.auth.authorizedGlobalActions.indexOf(name) >= 0;
      return retval;
    } else return false;
  }

  /* to delete after test openNkpLogyDialog() {
    const dialogRef = this.dialog.open(GenerateNkpLogsDialogComponent, {
      width: '600px',
      panelClass: 'app-generate-nkp-logs-dialog'
    });
  }

  openDeleteStatisticsDialog() {
    const dialogRef = this.dialog.open(DeleteStatisticsDialogComponent, {
      width: '600px',
      panelClass: 'app-delete-statistics-dialog'
    });
  } */

  changeView(view: string) {
    this.view = view;
    this.local.setStringProperty('repository.view', view);
    this.router.navigate(['/repository/', view]);
  }


  openDeleteObjectsLowLevelDialog() {
    const dialogRef = this.dialog.open(DeleteObjectsLowLevelDialogComponent, {
      width: '600px',
      panelClass: 'app-delete-objects-low-level-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar('snackbar.error.deleteObjectsLowLevel')
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else if (result == 1) {
        this.ui.showInfoSnackBar('snackbar.success.deleteObjectsLowLevel.1');
      } else if (result == 2 || result == 3 || result == 4) {
        this.ui.showInfoSnackBar('snackbar.success.deleteObjectsLowLevel.2-4', {value: result});
      } else {
        this.ui.showInfoSnackBar('snackbar.success.deleteObjectsLowLevel.more', {value: result});
      }
    });
  }

  openScheduleDeleteObjectsSmartDialog() {
    const dialogRef = this.dialog.open(ScheduleDeleteObjectsSmartComponent, {
      width: '600px',
      panelClass: 'app-schedule-delete-objects-smart'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar('snackbar.error.deleteObjectsSmart')
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else if (result == 1) {
        this.ui.showInfoSnackBar('snackbar.success.deleteObjectsSmart.1');
      } else if (result == 2 || result == 3 || result == 4) {
        this.ui.showInfoSnackBar('snackbar.success.deleteObjectsSmart.2-4', {value: result});
      } else {
        this.ui.showInfoSnackBar('snackbar.success.deleteObjectsSmart.more', {value: result});
      }
    });
  }




  openScheduleSyncWithSdnntDialog() {
    const dialogRef = this.dialog.open(ScheduleSyncWithSdnntComponent, {
      width: '1200px',
      panelClass: 'app-schedule-sync-with-sdnnt'
    });
  }

  openScheduleStartTheSdnntReviewProcessDialog() {
    const dialogRef = this.dialog.open(ScheduleStartTheSdnntReviewProcessComponent, {
      width: '600px',
      panelClass: 'app-schedule-start-the-sdnnt-review-process'
    });
  }

  openScheduleChangeFlagOnLicenseDialog() {
    const dialogRef = this.dialog.open(ScheduleChangeFlagOnLicenseDialogComponent, {
      width: '600px',
      panelClass: 'app-schedule-change-flag-on-license-dialog'
    });
  }

  openRemoveTheVisibilityFlagDialog() {
    const dialogRef = this.dialog.open(ScheduleRemoveTheVisibilityFlagDialogComponent, {
      width: '600px',
      panelClass: 'app-schedule-remove-the-visibility-flag-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
    if (result === 'error') {
      this.ui.showErrorSnackBar('snackbar.error.scheduleRemovePolicyByPid')
    } else if (result === 'cancel' || result === undefined) {
      //nothing, dialog was closed
    } else if (result == 1) {
      this.ui.showInfoSnackBar('snackbar.success.scheduleRemovePolicyByPid.1');
    } else if (result == 2 || result == 3 || result == 4) {
      this.ui.showInfoSnackBar('snackbar.success.scheduleRemovePolicyByPid.2-4', {value: result});
    } else {
      this.ui.showInfoSnackBar('snackbar.success.scheduleRemovePolicyByPid.more', {value: result});
    }})
  }

  openScheduledReHarvestSpecificPidsDialog() {
    const dialogRef = this.dialog.open(ScheduleReHarvestSpecificPidsDialogComponent, {
      width: '600px',
      panelClass: 'app-schedule-re-harvest-specific-pids-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar('snackbar.error.scheduleRemovePolicyByPid')
      } else if (result === 'cancel' || result === undefined) {
        //nothing, dialog was closed
      } else if (result == 1) {
        this.ui.showInfoSnackBar('snackbar.success.scheduleRemovePolicyByPid.1');
      } else if (result == 2 || result == 3 || result == 4) {
        this.ui.showInfoSnackBar('snackbar.success.scheduleRemovePolicyByPid.2-4', {value: result});
      } else {
        this.ui.showInfoSnackBar('snackbar.success.scheduleRemovePolicyByPid.more', {value: result});
      }})
  
  }

  openScheduleMigrateCollectionsDialog() {
    const dialogRef = this.dialog.open(ScheduleMigrateCollectionsDialogComponent, {
      width: '600px',
      panelClass: 'app-schedule-migrate-collections-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.k5) {
        this.adminApi.scheduleProcess({
          defid: 'migrate-collections-from-k5',
          params: {
            k5: result.k5
          }
        }).subscribe(response => {

          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
          this.router.navigate(['processes']))
          this.ui.showInfoSnackBar('snackbar.success.startTheProcess');
  
        }, error => {
          console.log(error);
        });
      }
    });
  }

  isDefaultSetQueryChanged() {
    return this.defaultSet?.filterQuery !== this.deafultSetQuery;    
  }

  saveImplicitSet() {

    // check if default is null
    if (this.defaultSet == null) {
      this.defaultSet = new OAISet('DEFAULT', '', '','');
    }


    function replaceSpacesWithPlus(inputString: string): string {
      return inputString.replace(/\s+/g, '+');
    }
  
    this.defaultSet.filterQuery = this.deafultSetQuery;

    let nameProp =  `oai.set.DEFAULT.name`;
    let descProp =  `oai.set.DEFAULT.description`;
    let filterProp =  `oai.set.DEFAULT.filter`;

    let object ={ [nameProp]:this.defaultSet.setName, [descProp]:this.defaultSet.setDescription, 
      [filterProp]: replaceSpacesWithPlus( this.defaultSet.filterQuery)};


    this.adminApi.setConfigProperties(object).subscribe(res=> {
      this.ui.showInfoSnackBar('snackbar.success.savingAnItem');
      this.defaultSet = null;
      this.reloadOAI();
  });



    // ready for success
    // ready for error
    //this.ui.showErrorSnackBar('snackbar.error.savingAnItem')
  }

  openAddNewSetDialog() {
    const dialogRef = this.dialog.open(AddNewSetDialogComponent, {
      width: '600px',
      panelClass: 'app-add-new-set-dialog'
    });




    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar('snackbar.error.scheduleRemovePolicyByPid')
      } else if (result === 'cancel' || result === undefined) {
        //cancel
      } else {
        this.adminApi.setConfigProperties(result.props).subscribe(res=> {
            this.ui.showInfoSnackBar('snackbar.success.savingAnRecord');
            this.reloadOAI();
        });

      }});
  }


  openEditSetDialog(oaiSet: OAISet) {
    const dialogRef = this.dialog.open(EditSetDialogComponent, {
      data:{
        id: oaiSet.setSpec,
        name: oaiSet.setName,
        description: oaiSet.setDescription,
        filter: oaiSet.filterQuery
      },
      width: '600px',
      panelClass: 'app-edit-set-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.ui.showErrorSnackBar('snackbar.error.scheduleRemovePolicyByPid');
      } else if (result === 'cancel' || result === undefined) {
        //cancel
      } else {
      
        this.adminApi.setConfigProperties(result.props).subscribe(res=> {
            this.ui.showInfoSnackBar('snackbar.success.savingAnRecord');
            this.sets = {}; 
            this.reloadOAI();
        });

      }});

  }

  deleteSet(oaiSet:OAISet) {

    let nameProp =  `oai.set.${oaiSet.setSpec}.name`;
    let descProp =  `oai.set.${oaiSet.setSpec}.description`;
    let filterProp =  `oai.set.${oaiSet.setSpec}.filter`;

    let object ={ [nameProp]:'', [descProp]:'', [filterProp]:''};


    this.adminApi.deleteConfigProperites(object).subscribe(res=> {
      this.ui.showInfoSnackBar('snackbar.success.deletingItem');
      this.sets = {}; 
      this.reloadOAI();
    });

  }

}
