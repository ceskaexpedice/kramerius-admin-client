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
import { ApiService } from './services/api.service';
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
import { CKEditorModule} from '@ckeditor/ckeditor5-angular';
import { ModsParserService } from './services/mods-parser.service';
import { UIService } from './services/ui.service';
import { CollectionComponent } from './components/collections/collection/collection.component';
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
    CollectionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
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
    ApiService,
    UIService,
    ModsParserService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  entryComponents: [
    SimpleDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
