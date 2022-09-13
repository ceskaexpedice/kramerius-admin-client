import { Injectable } from '@angular/core';
import { HttpEvent, HttpRequest, HttpInterceptor, HttpHandler, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { AppSettings } from './app-settings';
import { Observable,throwError, } from 'rxjs';
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
      request = request.clone({
        setHeaders: {
          'Authorization': 'Bearer ' + token
        }
      });
    }

    return next.handle(request);

    /** TODO: Check situation when  token expired  */
    // return next.handle(request).pipe(
      
    //     map(res => {
    //         //console.log("Passed through the interceptor in response");
    //         return res
    //     }),
                
    //     catchError((error: HttpErrorResponse) => {

          
    //       this.appSettings.interceptresponse.emit(error.status);
    //       //let errorMsg = `Error Code: ${error.status},  Message: ${error.message}`;
    //       return Observable.of({'message':error.message});
    //       //return of(error);
    //     })
    //   );
  }
}