import { AuthService } from './../services/auth.service';

import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService,
              private router: Router) { }

    canActivate(): Observable<boolean>|boolean {
      console.log('canActivate');
      return Observable.create(observer => {
        if (this.authService.isLoggedIn()) {
          observer.next(true);
          observer.complete();
        } else {
            observer.next(false);
            observer.complete();
            this.router.navigate(['/login']);
        }
        // if (this.authService.checked) {
        //   console.log('guard', 'p2 ' + this.authService.authorized);
        //   observer.next(this.authService.authorized);
        //   observer.complete();
        //   if (!this.authService.authorized) {
        //     this.router.navigate(['/login']);
        //   }
        //   return;
        // }
        // this.authService.isAauthorized(
        //   (success) => {
        //     if (success) {
        //       console.log('guard', 'p3 true');
        //       observer.next(true);
        //       observer.complete();
        //     } else {
        //       console.log('guard', 'p3 false');
        //       observer.next(false);
        //       observer.complete();
        //       this.router.navigate(['/login']);
        //     }
        // });
      });
    }

}
