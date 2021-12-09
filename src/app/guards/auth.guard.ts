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
          // this.authService.afterLogin();
          console.log('val1', this.authService.user);
          observer.next(this.authService.user.isAdmin());
          observer.complete();
          return;
        }
        this.tokenService.validateToken().subscribe(
          () => {
            this.authService.afterLogin();
            console.log('val2', this.authService.user);

            observer.next(this.authService.user && this.authService.user.isAdmin());
            observer.complete();
          },
          () => {
          this.router.navigate(['/login']);
          observer.next(false);
        });
      });
    }

}
