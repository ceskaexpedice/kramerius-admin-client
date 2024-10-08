import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HomeComponent } from './pages/home/home.component';
import { ProcessesComponent } from './pages/processes/processes.component';
import { LoginComponent } from './pages/account/login/login.component';
import { AuthService } from './services/auth.service';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppSettings } from './services/app-settings';
import { DurationPipe } from './pipes/duration.pipe';
import { ShortenPipe } from './pipes/shorten.pipe';
import { DatetimePipe } from './pipes/datetime.pipe';
import { ProcessComponent } from './pages/processes/process/process.component';
import { SimpleDialogComponent } from './dialogs/simple-dialog/simple-dialog.component';
import { AuthInterceptor } from './services/auth-interceptor';
import { LogsComponent } from './pages/processes/process/logs/logs.component';
import { CollectionsComponent } from './pages/collections/collections.component';
import { CollectionEditComponent } from './pages/collections/collection-edit/collection-edit.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { UIService } from './services/ui.service';
import { CollectionComponent } from './pages/collections/collection/collection.component';
import { AdminApiService } from './services/admin-api.service';
import { ClientApiService } from './services/client-api.service';
import { CollectionsService } from './services/collections.service';
import { DevComponent } from './pages/dev/dev.component';
import { IndexingComponent } from './pages/indexing/indexing.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ConfigComponent } from './components/config/config.component';
import { ScheduleIndexationByPidDialogComponent } from './dialogs/schedule-indexation-by-pid-dialog/schedule-indexation-by-pid-dialog.component';
import { ScheduleIndexationByModelDialogComponent } from './dialogs/schedule-indexation-by-model-dialog/schedule-indexation-by-model-dialog.component';
import { ScheduleIndexationsByMultiplePidsDialogComponent } from './dialogs/schedule-indexations-by-multiple-pids-dialog/schedule-indexations-by-multiple-pids-dialog.component';
import { ScheduleChangePolicyByPidDialogComponent } from './dialogs/schedule-change-policy-by-pid-dialog/schedule-change-policy-by-pid-dialog.component';
import { RepositoryComponent } from './pages/repository/repository.component';
import { ScheduleProcessingIndexRebuildDialogComponent } from './dialogs/schedule-processing-index-rebuild-dialog/schedule-processing-index-rebuild-dialog.component';
import { ScheduleImportFoxmlDialogComponent } from './dialogs/schedule-import-foxml-dialog/schedule-import-foxml-dialog.component';
import { ScheduleImportNdkDialogComponent } from './dialogs/schedule-import-ndk-dialog/schedule-import-ndk-dialog.component';
import { ScheduleAddLicenseDialogComponent } from './dialogs/schedule-add-license-dialog/schedule-add-license-dialog.component';
import { ScheduleRemoveLicenseDialogComponent } from './dialogs/schedule-remove-license-dialog/schedule-remove-license-dialog.component';
import { AccessComponent } from './pages/access/access.component';
import { CreateOrEditLicenseDialogComponent } from './dialogs/create-or-edit-license-dialog/create-or-edit-license-dialog.component';
import { LicensesComponent } from './pages/access/licenses/licenses.component';
import { RolesComponent } from './pages/access/roles/roles.component';
import { CreateOrEditRoleDialogComponent } from './dialogs/create-or-edit-role-dialog/create-or-edit-role-dialog.component';
import { LocalStorageService } from './services/local-storage.service';
import { RightsComponent } from './pages/access/rights/rights.component';
import { CreateOrEditRightDialogComponent } from './dialogs/create-or-edit-right-dialog/create-or-edit-right-dialog.component';
import { ParamsComponent } from './pages/access/params/params.component';
import { ImportComponent } from './pages/import/import.component';
import { ImportService } from './services/import.service';
import { TreeComponent } from './pages/import/tree/tree.component';
import { ScheduleProcessingIndexRebuildForObjectDialogComponent } from './dialogs/schedule-processing-index-rebuild-for-object-dialog/schedule-processing-index-rebuild-for-object-dialog.component';
import { AuthComponent } from './components/auth/auth.component';
import { ObjectComponent } from './pages/access/object/object.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatBadgeModule } from '@angular/material/badge';
import { AddItemsToCollectionDialogComponent } from './dialogs/add-items-to-collection-dialog/add-items-to-collection-dialog.component';
import { AddItemToCollectionDialogComponent } from './dialogs/add-item-to-collection-dialog/add-item-to-collection-dialog.component';
import { CollectionDetailComponent } from './pages/collections/collection-detail/collection-detail.component';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { LineChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { GenerateNkpLogsDialogComponent } from './dialogs/generate-nkp-logs-dialog/generate-nkp-logs-dialog.component';
import { DeleteStatisticsDialogComponent } from './dialogs/delete-statistics-dialog/delete-statistics-dialog.component';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { PaginatorI18n } from './paginator-i18n';
import { CollectionNewComponent } from './pages/collections/collection-new/collection-new.component';
import { DeleteObjectsLowLevelDialogComponent } from './dialogs/delete-objects-low-level-dialog/delete-objects-low-level-dialog.component';
import { ScheduleDeleteObjectsSmartComponent } from './dialogs/schedule-delete-objects-smart/schedule-delete-objects-smart.component';
import { CancelScheduledProcessesDialogComponent } from './dialogs/cancel-scheduled-processes-dialog/cancel-scheduled-processes-dialog.component';
import { StatisticsComponent } from './pages/statistics/statistics.component';
import { CollectionContentComponent } from './pages/collections/collection-content/collection-content.component';
import { CollectionContextComponent } from './pages/collections/collection-context/collection-context.component';
import { FooterComponent } from './components/footer/footer.component';
import { CreateNewCollectionDialogComponent } from './dialogs/create-new-collection-dialog/create-new-collection-dialog.component';
import { DeleteCollectionDialogComponent } from './dialogs/delete-collection-dialog/delete-collection-dialog.component';
import { CdkApiService } from './services/cdk-api.service';
import { IsoConvertService } from './services/isoconvert.service';
import { CdkComponent } from './pages/cdk/cdk.component';
import { CdkProxyComponent } from './pages/cdk/cdk-proxy/cdk-proxy.component';
import { CdkProxyDetailComponent } from './pages/cdk/cdk-proxy/cdk-proxy-detail/cdk-proxy-detail.component';
import { CdkEuropeanouComponent } from './pages/cdk/cdk-europeanou/cdk-europeanou.component';
import { ScheduleSyncWithSdnntComponent } from './dialogs/schedule-sync-with-sdnnt/schedule-sync-with-sdnnt.component';
import { DeleteSelectedCollectionsDialogComponent } from './dialogs/delete-selected-collections-dialog/delete-selected-collections-dialog.component';
import { ScheduleStartTheSdnntReviewProcessComponent } from './dialogs/schedule-start-the-sdnnt-review-process/schedule-start-the-sdnnt-review-process.component';
import { DeleteSelectedItemsFromCollectionComponent } from './dialogs/delete-selected-items-from-collection/delete-selected-items-from-collection.component';
import { ScheduleChangeFlagOnLicenseDialogComponent } from './dialogs/schedule-change-flag-on-license-dialog/schedule-change-flag-on-license-dialog.component';
import { ScheduleRemoveTheVisibilityFlagDialogComponent } from './dialogs/schedule-remove-the-visibility-flag-dialog/schedule-remove-the-visibility-flag-dialog.component';
import { AboutDialogComponent } from './dialogs/about-dialog/about-dialog.component';
import { AddNewParameterDialogComponent } from './dialogs/add-new-parameter-dialog/add-new-parameter-dialog.component';
import { UserInfoDialogComponent } from './dialogs/user-info-dialog/user-info-dialog.component';
import { FileDownloadService } from './services/file-download';
import { ShowMappingDialogComponent } from './dialogs/show-mapping-dialog/show-mapping-dialog.component';
import { ScheduleReHarvestSpecificPidsDialogComponent } from './dialogs/schedule-re-harvest-specific-pids-dialog/schedule-re-harvest-specific-pids-dialog.component';
import { ScheduleMigrateCollectionsDialogComponent } from './dialogs/schedule-migrate-collections-dialog/schedule-migrate-collections-dialog.component';
import { CreateCollectionBackupDialogComponent } from './dialogs/create-collection-backup-dialog/create-collection-backup-dialog.component';
import { RestoreFromCollectionBackupDialogComponent } from './dialogs/restore-from-collection-backup-dialog/restore-from-collection-backup-dialog.component';
import { AddCuttingDialogComponent } from './dialogs/add-cutting-dialog/add-cutting-dialog.component';
import { EditSetDialogComponent } from './dialogs/edit-set-dialog/edit-set-dialog.component';
import { AddNewSetDialogComponent } from './dialogs/add-new-set-dialog/add-new-set-dialog.component';
import { OAIApiService } from './services/oai-api.services';
import { CdkObjectReharvestComponent } from './pages/cdk/cdk-object-reharvest/cdk-object-reharvest.component';
import { RunImportComponent } from './dialogs/run-import/run-import.component';
import {ShowSeChannelDialogComponent} from './dialogs/show-sechannel-dialog/show-sechannel-dialog.component'
//import { FileSaverModule } from 'ngx-filesaver';
import { MatChipsModule } from '@angular/material/chips';
import { CdkCollectionsComponent } from './pages/cdk-collections/cdk-collections.component';
import { CdkCollectionComponent } from './pages/cdk-collections/cdk-collection/cdk-collection.component';
import { CdkCollectionContentComponent } from './pages/cdk-collections/cdk-collection-content/cdk-collection-content.component';
import { CdkCollectionContextComponent } from './pages/cdk-collections/cdk-collection-context/cdk-collection-context.component';
import { CdkCollectionDetailComponent } from './pages/cdk-collections/cdk-collection-detail/cdk-collection-detail.component';
import { CdkCollectionNewComponent } from './pages/cdk-collections/cdk-collection-new/cdk-collection-new.component';
import { CdkCollectionEditComponent } from './pages/cdk-collections/cdk-collection-edit/cdk-collection-edit.component';
import { CdkCollectionsCdkComponent } from './pages/cdk-collections/cdk-collections-cdk/cdk-collections-cdk.component';
import { CdkCollectionsDiglibComponent } from './pages/cdk-collections/cdk-collections-diglib/cdk-collections-diglib.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json?' + AppSettings.adminClientVersion);
}


export function createCustomMatPaginatorIntl(
  translateService: TranslateService
) { return new PaginatorI18n(translateService); }

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    ProcessesComponent,
    LoginComponent,
    DurationPipe,
    ShortenPipe,
    DatetimePipe,
    ProcessComponent,
    SimpleDialogComponent,
    LogsComponent,
    CollectionEditComponent,
    CollectionsComponent,
    CollectionComponent,
    DevComponent,
    IndexingComponent,
    ConfigComponent,
    ScheduleIndexationByPidDialogComponent,
    ScheduleIndexationByModelDialogComponent,
    ScheduleIndexationsByMultiplePidsDialogComponent,
    ScheduleChangePolicyByPidDialogComponent,
    RepositoryComponent,
    ScheduleProcessingIndexRebuildDialogComponent,
    ScheduleImportFoxmlDialogComponent,
    ScheduleImportNdkDialogComponent,
    ScheduleAddLicenseDialogComponent,
    ScheduleRemoveLicenseDialogComponent,
    AccessComponent,
    LicensesComponent,
    CreateOrEditLicenseDialogComponent,
    RolesComponent,
    CreateOrEditRoleDialogComponent,
    RightsComponent,
    CreateOrEditRightDialogComponent,
    ParamsComponent,
    ImportComponent,
    TreeComponent,
    ScheduleProcessingIndexRebuildForObjectDialogComponent,
    ObjectComponent,
    AuthComponent,
    AddItemsToCollectionDialogComponent,
    AddItemToCollectionDialogComponent,
    CollectionDetailComponent,
    GenerateNkpLogsDialogComponent,
    DeleteStatisticsDialogComponent,
    CollectionNewComponent,
    DeleteObjectsLowLevelDialogComponent,
    ScheduleDeleteObjectsSmartComponent,
    CancelScheduledProcessesDialogComponent,
    StatisticsComponent,
    CollectionContentComponent,
    CollectionContextComponent,
    FooterComponent,
    CreateNewCollectionDialogComponent,
    DeleteCollectionDialogComponent,
    CdkComponent,
    CdkProxyComponent,
    CdkProxyDetailComponent,
    CdkEuropeanouComponent,
    ScheduleSyncWithSdnntComponent,
    DeleteSelectedCollectionsDialogComponent,
    ScheduleStartTheSdnntReviewProcessComponent,
    DeleteSelectedItemsFromCollectionComponent,
    ScheduleChangeFlagOnLicenseDialogComponent,
    ScheduleRemoveTheVisibilityFlagDialogComponent,
    AboutDialogComponent,
    AddNewParameterDialogComponent,
    UserInfoDialogComponent,
    ShowMappingDialogComponent,
    ShowSeChannelDialogComponent,
    ScheduleReHarvestSpecificPidsDialogComponent,
    ScheduleMigrateCollectionsDialogComponent,
    CreateCollectionBackupDialogComponent,
    RestoreFromCollectionBackupDialogComponent,
    AddCuttingDialogComponent,
    EditSetDialogComponent,
    AddNewSetDialogComponent,
    CdkObjectReharvestComponent,
    RunImportComponent,
    CdkCollectionsComponent,
    CdkCollectionComponent,
    CdkCollectionContentComponent,
    CdkCollectionContextComponent,
    CdkCollectionDetailComponent,
    CdkCollectionNewComponent,
    CdkCollectionEditComponent,
    CdkCollectionsCdkComponent,
    CdkCollectionsDiglibComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    MatProgressBarModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CKEditorModule,
    FlexLayoutModule,
    MatBadgeModule,
    MatChipsModule,
    //FileSaverModule,
    NgxEchartsModule.forRoot({
      echarts
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),

  ],
  providers: [
    AuthService,
    AppSettings,
    ClientApiService,
    AdminApiService,
    OAIApiService,
    CollectionsService,
    LocalStorageService,
    UIService,
    ImportService,
    HttpClient,
    TranslateService,
    CdkApiService,
    FileDownloadService,
    IsoConvertService,
    {
      provide: MatPaginatorIntl, deps: [TranslateService],
      useFactory: createCustomMatPaginatorIntl
    },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  entryComponents: [
    SimpleDialogComponent,
    ScheduleIndexationByPidDialogComponent,
    ScheduleIndexationByModelDialogComponent,
    ScheduleIndexationsByMultiplePidsDialogComponent,
    ScheduleChangePolicyByPidDialogComponent,
    ScheduleProcessingIndexRebuildDialogComponent,
    ScheduleProcessingIndexRebuildForObjectDialogComponent,
    ScheduleImportFoxmlDialogComponent,
    ScheduleImportNdkDialogComponent,
    ScheduleAddLicenseDialogComponent,
    ScheduleRemoveLicenseDialogComponent,
    CreateOrEditLicenseDialogComponent,
    CreateOrEditRoleDialogComponent,
    CreateOrEditRightDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
