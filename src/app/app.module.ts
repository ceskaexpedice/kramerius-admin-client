import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AngularTokenModule } from 'angular-token';
import { HomeComponent } from './components/home/home.component';
import { ProcessesComponent } from './components/processes/processes.component';
import { LoginComponent } from './components/account/login/login.component';
import { OmniauthComponent } from './components/account/omniauth/omniauth.component';
import { AuthService } from './services/auth.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppSettings } from './services/app-settings';
import { environment } from 'src/environments/environment';
import { DurationPipe } from './pipes/duration.pipe';
import { ShortenPipe } from './pipes/shorten.pipe';
import { FlexLayoutModule } from '@angular/flex-layout';
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
import { MatProgressBarModule } from '@angular/material';
@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    ProcessesComponent,
    LoginComponent,
    OmniauthComponent,
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
    IndexingComponent
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
    FlexLayoutModule,
    CKEditorModule,
    AngularTokenModule.forRoot({
      apiBase: environment.cloudApiBase,
      oAuthBase: environment.cloudApiBase,
      oAuthCallbackPath: 'omniauth',
      oAuthPaths: {
        google: 'auth/google_oauth2'
      },
      oAuthWindowType: 'newWindow'
    })
  ],
  providers: [
    AngularTokenModule,
    AuthService,
    AppSettings,
    ClientApiService,
    AdminApiService,
    CollectionsService,
    UIService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  entryComponents: [
    SimpleDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
