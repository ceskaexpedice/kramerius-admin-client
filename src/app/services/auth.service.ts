import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppSettings } from './app-settings';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RightAction } from '../models/right-action.model';

@Injectable()
export class AuthService {

  static AUTH_AUTHORIZED = 1;
  static AUTH_NOT_AUTHORIZED = 2;
  static AUTH_NOT_LOGGED_IN = 3;

  user: User;
  static token: string;

  authorizedGlobalActions: string[];

  constructor(private http: HttpClient, private settings: AppSettings) {
    AuthService.token = localStorage.getItem('account.token');
    this.getAuthorizedActions('uuid:1').subscribe((rAct: RightAction[]) => {
      this.authorizedGlobalActions = [];
      rAct.forEach(rA => {
        this.authorizedGlobalActions.push(rA.code);
      });
    });
    
  }


  baseUrl(): string {
    return location.origin + this.settings.deployPath;
  }

  login() {
    const redircetUri = `${this.baseUrl()}/keycloak`;
    const url = `${this.settings.keycloak.baseUrl}/realms/kramerius/protocol/openid-connect/auth?client_id=${this.settings.keycloak.clientId}&redirect_uri=${redircetUri}&response_type=code`;
    window.open(url, '_top');
  }

  logout(suffix: string = "") {
    AuthService.token = null;
    localStorage.removeItem('account.token');
    this.user = null;
    this.logoutKramerius().subscribe(() => {
      const redircetUri = `${this.baseUrl()}${suffix}`;
      const url = `${this.settings.keycloak.baseUrl}/realms/kramerius/protocol/openid-connect/logout?redirect_uri=${redircetUri}`;
      window.open(url, '_top');
    });
  }

  isLoggedIn() {
    return this.user && this.user.isLoggedIn();
  }

  isAuthorized() {
    return this.user && this.user.isAdmin();
  }

  getAuthorizedActions(pid: string) {
    return this.http.get(`${this.settings.clientApiBaseUrl}/user/actions?pid=${pid}`)
        .pipe(map(response => RightAction.fromJsonArray(response)));
  }

  /*
  private validateToken(): Observable<User> {
    return this.http.get(`${this.settings.clientApiBaseUrl}/user`)
        .pipe(map(response => User.fromJson(response)));
  }*/


  getTextProfileImage(): string {
    if (!this.user) {
        return '?';
    }
    return (this.user.name || this.user.uid || '?')[0];
  }

  checkToken(callback: (number) => void) {
    if (!AuthService.token) {
      callback(AuthService.AUTH_NOT_LOGGED_IN);
      return;
    }
    this.validateToken().subscribe((user: User) => {
      this.user = user;
      if (this.isAuthorized()) {
        callback(AuthService.AUTH_AUTHORIZED);
      } else {
        callback(AuthService.AUTH_NOT_AUTHORIZED);
      }
    },
    (error) => {
      callback(AuthService.AUTH_NOT_LOGGED_IN);
    });
  }

  keycloakAuth(code: string, callback: (number) => void = null) {
    this.getToken(code).subscribe(
        (token: string) => {
            if (!token) {
                callback(AuthService.AUTH_NOT_LOGGED_IN);
            } else {
                AuthService.token = token;
                localStorage.setItem('account.token', token);
                this.checkToken(callback);
            }
        },
        (error) => {
            callback(AuthService.AUTH_NOT_LOGGED_IN);
        }
    );
  }

  private validateToken(): Observable<User> {
    return this.http.get(`${this.settings.clientApiBaseUrl}/user`)
        .pipe(map(response => User.fromJson(response)));
  }


  private logoutKramerius(): Observable<any> {
    return this.http.get(`${this.settings.clientApiBaseUrl}/user/logout`);
  }

  private getToken(code: string): Observable<string> {
    const url = `${this.settings.keycloak.baseUrl}/realms/kramerius/protocol/openid-connect/token`;
    const redircetUri = `${this.baseUrl()}/keycloak`;
    const body = `grant_type=authorization_code&code=${code}&client_id=${this.settings.keycloak.clientId}&client_secret=${this.settings.keycloak.secret}&redirect_uri=${redircetUri}`; 
    const options = {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        })
    };
    return this.http.post(url, body, options).pipe(map(response => response['access_token']));
}
  
}