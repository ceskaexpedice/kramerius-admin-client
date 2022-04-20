import { AuthService } from './../services/auth.service';

import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService,
              private router: Router) { }

    canActivate(): Observable<boolean>|boolean {
      console.log('canActivate');
      return Observable.create(observer => {
        if (this.auth.isAuthorized()) {
          observer.next(true);
          observer.complete();
        } else {
          this.auth.checkToken((status: number) => {
            if (status == AuthService.AUTH_AUTHORIZED) {
              observer.next(true);
              observer.complete();
            } else {
              const path = window.location.pathname + window.location.search;
              console.log('settings target', path);
              localStorage.setItem('login.url', path);
              observer.next(false);
              observer.complete();
              this.router.navigate(['/login']);
            }
          });
        }
      });
    }

}
