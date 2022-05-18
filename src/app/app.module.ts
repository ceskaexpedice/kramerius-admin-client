import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HomeComponent } from './components/home/home.component';
import { ProcessesComponent } from './components/processes/processes.component';
import { LoginComponent } from './components/account/login/login.component';
import { AuthService } from './services/auth.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppSettings } from './services/app-settings';
import { DurationPipe } from './pipes/duration.pipe';
import { ShortenPipe } from './pipes/shorten.pipe';
import { DatetimePipe } from './pipes/datetime.pipe';
import { ProcessComponent } from './components/processes/process/process.component';
import { SimpleDialogComponent } from './dialogs/simple-dialog/simple-dialog.component';
import { AuthInterceptor } from './services/auth-interceptor';
import { LogsComponent } from './components/processes/process/logs/logs.component';
import { CollectionsComponent } from './components/collections/collections.component';
import { EditCollectionComponent } from './components/collections/edit-collection/edit-collection.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { UIService } from './services/ui.service';
import { CollectionComponent } from './components/collections/collection/collection.component';
import { AdminApiService } from './services/admin-api.service';
import { ClientApiService } from './services/client-api.service';
import { CollectionsService } from './services/collections.service';
import { DevComponent } from './components/dev/dev.component';
import { IndexingComponent } from './components/indexing/indexing.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ConfigComponent } from './components/config/config.component';
import { ScheduleIndexationByPidDialogComponent } from './dialogs/schedule-indexation-by-pid-dialog/schedule-indexation-by-pid-dialog.component';
import { ScheduleIndexationByModelDialogComponent } from './dialogs/schedule-indexation-by-model-dialog/schedule-indexation-by-model-dialog.component';
import { ScheduleIndexationsByMultiplePidsDialogComponent } from './dialogs/schedule-indexations-by-multiple-pids-dialog/schedule-indexations-by-multiple-pids-dialog.component';
import { ScheduleChangePolicyByPidDialogComponent } from './dialogs/schedule-change-policy-by-pid-dialog/schedule-change-policy-by-pid-dialog.component';
import { RepositoryComponent } from './components/repository/repository.component';
import { ScheduleProcessingIndexRebuildDialogComponent } from './dialogs/schedule-processing-index-rebuild-dialog/schedule-processing-index-rebuild-dialog.component';
import { ScheduleImportFoxmlDialogComponent } from './dialogs/schedule-import-foxml-dialog/schedule-import-foxml-dialog.component';
import { ScheduleImportNdkDialogComponent } from './dialogs/schedule-import-ndk-dialog/schedule-import-ndk-dialog.component';
import { ScheduleAddLicenseDialogComponent } from './dialogs/schedule-add-license-dialog/schedule-add-license-dialog.component';
import { ScheduleRemoveLicenseDialogComponent } from './dialogs/schedule-remove-license-dialog/schedule-remove-license-dialog.component';
import { AccessComponent } from './components/access/access.component';
import { NewLicenseDialogComponent } from './dialogs/new-license-dialog/new-license-dialog.component';
import { LicensesComponent } from './components/access/licenses/licenses.component';
import { RolesComponent } from './components/access/roles/roles.component';
import { NewRoleDialogComponent } from './dialogs/new-role-dialog/new-role-dialog.component';
import { LocalStorageService } from './services/local-storage.service';
import { ActionsComponent } from './components/access/actions/actions.component';
import { NewRightDialogComponent } from './dialogs/new-right-dialog/new-right-dialog.component';
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
    EditCollectionComponent,
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
    NewLicenseDialogComponent,
    RolesComponent,
    NewRoleDialogComponent,
    ActionsComponent,
    NewRightDialogComponent,
    ParamsComponent,
    ImportComponent,
    TreeComponent,
    ScheduleProcessingIndexRebuildForObjectDialogComponent,
    ObjectComponent,
    AuthComponent,
    AddItemsToCollectionDialogComponent
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
    MatBadgeModule
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
    NewLicenseDialogComponent,
    NewRoleDialogComponent,
    NewRightDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
