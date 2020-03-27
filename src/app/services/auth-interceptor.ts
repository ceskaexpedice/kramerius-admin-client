import { Injectable } from '@angular/core';
import { HttpEvent, HttpRequest, HttpInterceptor, HttpHandler } from '@angular/common/http';
import { AppSettings } from './app-settings';
import { Observable } from 'rxjs';
import { AngularTokenService } from 'angular-token';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private tokenService: AngularTokenService, private appSettings: AppSettings) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!request.url.startsWith(this.appSettings.adminApiBaseUrl)) {
      return next.handle(request);
    }
    const data = this.tokenService.currentAuthData;
    if (data) {
      request = request.clone({
        setHeaders: {
          'access-token': data.accessToken,
          'uid': data.uid,
          'client': data.client
        }
      });
    }
    return next.handle(request);
  }
}