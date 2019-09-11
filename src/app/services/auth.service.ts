import { Injectable } from '@angular/core';
import { AngularTokenService } from 'angular-token';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../models/user.model';

@Injectable()
export class AuthService {

  user: User;

  constructor(private tokenService: AngularTokenService,
              private http: HttpClient) {
      this.tokenService.validateToken().subscribe(
          response => {
              this.afterLogin();
          },
          error => {
              console.log('validateToken - error', error);
          }
      );
  }

  processOAuthCallback(callback: (success: boolean) => void) {
      this.tokenService.processOAuthCallback();
      this.tokenService.validateToken().subscribe(
        response => {
          this.afterLogin();
          if (callback) {
              callback(true);
          }
        },
        error => {
          if (callback) {
              callback(false);
          }
      }
    );
  }


  login(email: string, password: string, callback: (success: boolean) => void) {
      return this.tokenService.signIn({
        login: email,
        password: password
      }).subscribe(
      (response) => {
          this.afterLogin();
          if (callback) {
              callback(true);
          }
      },
      (error) => {
          if (callback) {
              callback(false);
          }
      });
  }

  activateAccount(uid: string, token: string, clinecId: string, password: string, passwordConfirmations: string, callback: (success: boolean) => void) {
      const headers = new HttpHeaders({'uid': uid, 'client': clinecId, 'access-token': token});
      const options = { headers: headers };
      const url = `${this.tokenService.apiBase}/auth/password?password=${password}&password_confirmation=${passwordConfirmations}`;
      this.http.put(url, null, options).subscribe(
          (response) => {
              console.log('activateAccount success', response);
              this.tokenService.validateToken().subscribe(
                  () => {
                      this.afterLogin();
                      if (callback) {
                          callback(true);
                      }
                  },
                  error => {
                      if (callback) {
                          callback(false);
                      }
                  }
              );
          },
          (error) => {
              console.log('activateAccount failure', error);
              if (callback) {
                  callback(false);
              }
          });
  }


  signInOAuth(provider: string, callback: (success: boolean) => void) {
      this.tokenService.tokenOptions.oAuthWindowType = 'sameWindow'; // 'newWindow';
      console.log('this.tokenService.tokenOptions', this.tokenService.tokenOptions);
      this.tokenService.signInOAuth(provider).subscribe(
          (response) => {
              console.log('signInOAuth success', response);
              if (callback) {
                  callback(true);
              }
          },
          (error) => {
              console.log('signInOAuth failure', error);
              if (callback) {
                  callback(false);
              }
          });
  }


  resetPassword(email: string, callback: (success: boolean) => void) {
      this.tokenService.tokenOptions.resetPasswordCallback = window.location.origin + '/reset-password';
      this.tokenService.resetPassword( {login: email}).subscribe(
          () => {
              if (callback) {
                  callback(true);
              }
          },
          (error) => {
              if (callback) {
                  callback(false);
              }
          });
  }

  register(name: string, email: string, password: string, passwordConfirmation: string, callback: (success: boolean) => void) {
      this.tokenService.tokenOptions.registerAccountCallback = window.location.origin + '/login';
      return this.tokenService.registerAccount({
          name: name,
          login: email,
          password: password,
          passwordConfirmation: passwordConfirmation
      }).subscribe(
      (response) => {
          console.log('register success', response);
          if (callback) {
              callback(true);
          }
      },
      (error) => {
          console.log('register error', error);
          if (callback) {
              callback(false);
          }
      });
  }

  logout(callback: () => any) {
      return this.tokenService.signOut().subscribe(() => {
          this.user = null;
          if (callback) {
              callback();
          }
      });
  }

  isLoggedIn(): boolean {
      return this.tokenService.userSignedIn() && !!this.tokenService.currentUserData;
  }

  getTextProfileImage(): string {
      const name = this.user.name;
      if (!name) {
          return '?';
      }
      return name[0];
  }

  private afterLogin() {
    const userData = this.tokenService.currentUserData;
    if (!userData) {
      // TODO: no user data
      return
    }
    const user = new User();
    user.email = userData.uid;
    user.name = userData.name;
    user.image = userData.image;
    this.user = user;
  }


}