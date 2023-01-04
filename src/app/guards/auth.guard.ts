import { AuthService } from './../services/auth.service';

import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService,
              private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>|boolean {
      //console.log('canActivate');
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
              localStorage.setItem('login.url', state.url);
              observer.next(false);
              observer.complete();
              this.router.navigate(['/login']);
            }
          });
        }
      });
    }

}
