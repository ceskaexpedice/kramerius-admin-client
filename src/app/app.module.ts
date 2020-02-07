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
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppSettings } from './services/app-settings';
import { ApiService } from './services/api.service';
import { environment } from 'src/environments/environment';
import { DurationPipe } from './pipes/duration.pipe';
import { ShortenPipe } from './pipes/shorten.pipe';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DatetimePipe } from './pipes/datetime.pipe';

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
    DatetimePipe
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
    ApiService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
