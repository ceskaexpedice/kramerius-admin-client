import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { UIService } from './services/ui.service';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppSettings } from './services/app-settings';
import { AuthService } from './services/auth.service';
import { AdminApiService } from './services/admin-api.service';
import { AuthInterceptor } from './services/auth-interceptor';
import { CdkApiService } from './services/cdk-api.service';
import { ClientApiService } from './services/client-api.service';
import { CollectionsService } from './services/collections.service';
import { FileDownloadService } from './services/file-download';
import { ImportService } from './services/import.service';
import { IsoConvertService } from './services/isoconvert.service';
import { LocalStorageService } from './services/local-storage.service';
import { OAIApiService } from './services/oai-api.services';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { PaginatorI18n } from './paginator-i18n';
import { AuthGuard } from './guards/auth.guard';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json?v=' + Date.now());
}

export function createCustomMatPaginatorIntl(
  translateService: TranslateService
) { return new PaginatorI18n(translateService); }

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    HttpClient,
    importProvidersFrom(
      FormsModule, ReactiveFormsModule, TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: (createTranslateLoader),
          deps: [HttpClient]
        }
      })),
    TranslateService,
    provideHttpClient(withInterceptorsFromDi()),
    AuthGuard,
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
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    importProvidersFrom(MatSnackBarModule),
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'cs-CZ' },
  ]
};
