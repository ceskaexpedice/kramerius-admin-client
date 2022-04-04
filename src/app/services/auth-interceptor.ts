import { Injectable } from '@angular/core';
import { HttpEvent, HttpRequest, HttpInterceptor, HttpHandler } from '@angular/common/http';
import { AppSettings } from './app-settings';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private appSettings: AppSettings, private auth: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    //console.log('intercepter', request.url);
    if (!request.url.startsWith(this.appSettings.coreBaseUrl)) {
      //console.log('intercepter', 'not');
      return next.handle(request);
    }
    const token = this.auth.token;
    if (token) {
      //console.log('intercepter', 'with token');

      request = request.clone({
        setHeaders: {
          'Authorization': 'Bearer ' + token
        }
      });
    }
    return next.handle(request);
  }
}



