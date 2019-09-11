import { AuthService } from './../services/auth.service';

import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularTokenService } from 'angular-token';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService,
              private tokenService: AngularTokenService,
              private router: Router) { }


    canActivate(): Observable<boolean>|boolean {
      console.log('canActivate');
      return Observable.create(observer => {
        if (this.authService.user) {
          observer.next(true);
          observer.complete();
          return;
        }
        this.tokenService.validateToken().subscribe(
          () => {
            observer.next(true);
            observer.complete();
          },
          () => {
          this.router.navigate(['/login']);
          observer.next(false);
        });
      });
    }

}
