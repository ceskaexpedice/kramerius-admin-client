import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HomeComponent } from './components/home/home.component';
import { ProcessesComponent } from './pages/processes/processes.component';
import { LoginComponent } from './components/account/login/login.component';
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
import { AccessComponent } from './components/access/access.component';
import { CreateOrEditLicenseDialogComponent } from './dialogs/create-or-edit-license-dialog/create-or-edit-license-dialog.component';
import { LicensesComponent } from './components/access/licenses/licenses.component';
import { RolesComponent } from './components/access/roles/roles.component';
import { CreateOrEditRoleDialogComponent } from './dialogs/create-or-edit-role-dialog/create-or-edit-role-dialog.component';
import { LocalStorageService } from './services/local-storage.service';
import { RightsComponent } from './components/access/rights/rights.component';
import { CreateOrEditRightDialogComponent } from './dialogs/create-or-edit-right-dialog/create-or-edit-right-dialog.component';
import { ParamsComponent } from './components/access/params/params.component';
import { ImportComponent } from './components/import/import.component';
import { ImportService } from './services/import.service';
import { TreeComponent } from './components/import/tree/tree.component';
import { ScheduleProcessingIndexRebuildForObjectDialogComponent } from './dialogs/schedule-processing-index-rebuild-for-object-dialog/schedule-processing-index-rebuild-for-object-dialog.component';
import { AuthComponent } from './components/auth/auth.component';
import { ObjectComponent } from './components/access/object/object.component';
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
import { CdkComponent } from './pages/cdk/cdk.component';
import { CdkProxyComponent } from './pages/cdk/cdk-proxy/cdk-proxy.component';
import { CdkProxyDetailComponent } from './pages/cdk/cdk-proxy/cdk-proxy-detail/cdk-proxy-detail.component';
import { CdkEuropeanouComponent } from './pages/cdk/cdk-europeanou/cdk-europeanou.component';
import { ScheduleSyncWithSdnntComponent } from './dialogs/schedule-sync-with-sdnnt/schedule-sync-with-sdnnt.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
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
    ScheduleSyncWithSdnntComponent
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
    CollectionsService,
    LocalStorageService,
    UIService,
    ImportService,
    HttpClient,
    TranslateService,
    CdkApiService,
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
