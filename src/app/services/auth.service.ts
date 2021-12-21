import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppSettings } from './app-settings';
import { LocalStorageService } from './local-storage.service';
import { JwtHelperService } from "@auth0/angular-jwt";

@Injectable()
export class AuthService {

  username: string;
  token: string;

  constructor(private http: HttpClient, private settings: AppSettings,  private locals: LocalStorageService) {
    this.checkToken(this.locals.getStringProperty('account.token'));
  }

  login(email: string, password: string, callback: (status: string) => void) {
    const body = `username=${email}&password=${password}`;
    this.http.post(`${this.settings.coreBaseUrl}api/auth/token`, body).subscribe(
      (result) => {
        console.log('login ok', result);
        const token = result['access_token'];
        if (this.checkToken(token)) {
          callback('authorized');
        } else {
          callback('logged_in_not_authorized');
        }
      },
      (error) => {
        console.log('login not ok', error);
        if (error.status == 401) {
          callback('not_logged_in');
        } else {
          callback('auth_error');
        }
      }
    );
  }

  logout() {
    this.token = null;
    this.username = null;
    this.locals.setStringProperty('account.token', '');
    this.locals.setStringProperty('account.username', '');
  }

  isLoggedIn() {
    return !!this.token;
  }

  // isAauthorized(callback: (success: boolean) => void) {
  //   this.http.get(`${this.settings.coreBaseUrl}api/admin/v1.0/processes/batches?offset=0&limit=1`).subscribe(
  //     (success) => {
  //       this.checked = true;
  //       this.authorized = true;
  //       console.log('isAauthorized', success);
  //       callback(true);
  //     },
  //     (error) => {
  //       console.log('isAauthorized', error);
  //       callback(false);
  //     });
  // }
 
  getTextProfileImage(): string {
    if (!this.username) {
        return '?';
    }
    return this.username[0];
  }


  checkToken(token: string): boolean {
    if (!token) {
      this.logout();
      return false;
    }
    console.log('??');
    const helper = new JwtHelperService();
    const decodedToken = helper.decodeToken(token);
    const expirationDate = helper.getTokenExpirationDate(token);
    const isExpired = helper.isTokenExpired(token);
    console.log('decodedToken', decodedToken);
    console.log('expirationDate', expirationDate);
    console.log('isExpired', isExpired);
    if (isExpired) {
      this.logout();
      return false;
    }
    const roles = decodedToken.realm_access.roles;
    if (!roles || roles.indexOf("kramerius_admin") < 0) {
      this.logout();
      return false;
    } 
    this.token = token;
    this.username = decodedToken.preferred_username;
    this.locals.setStringProperty('account.token', this.token);
    this.locals.setStringProperty('account.username', this.username);
    return true;
  }

  
}