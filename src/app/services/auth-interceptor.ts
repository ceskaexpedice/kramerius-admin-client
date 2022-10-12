import { Injectable } from '@angular/core';
import { HttpEvent, HttpRequest, HttpInterceptor, HttpHandler, HttpResponse, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { AppSettings } from './app-settings';
import { Observable,throwError,of } from 'rxjs';
import { map,catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private appSettings: AppSettings
    ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!request.url.startsWith(this.appSettings.coreBaseUrl)) {
      return next.handle(request);
    }
    const token = AuthService.token;
    if (token) {
      if (AuthService.tokenDeadline < new Date()) {
        this.appSettings.interceptresponse.emit({
          "type":"token_expired"
        });
      } else {
        request = request.clone({
          setHeaders: {
            'Authorization': 'Bearer ' + token
          }
        });
      }
    }
    return next.handle(request);

  }
}