import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppSettings } from './app-settings';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RightAction } from '../models/right-action.model';
import { Router } from '@angular/router';

@Injectable()
export class AuthService {

  static AUTH_AUTHORIZED = 1;
  static AUTH_NOT_AUTHORIZED = 2;
  static AUTH_NOT_LOGGED_IN = 3;

  static GLOBAL_ACTIONS_LOADED = 0;
  static SPECIFIC_ACTIONS_LOADED = 0;

  user: User;
  static token: string;
  static tokenTime: Date;
  static tokenDeadline: Date;
  static tokenCounter: number;

  // global actions
  authorizedGlobalActions: string[];

  // specific actions
  authorizedSpecificActions =  {};

  constructor(
    private http: HttpClient, 
    private settings: AppSettings,
    private router:Router
    ) {
    AuthService.token = localStorage.getItem('account.token');
    AuthService.tokenTime = new Date(localStorage.getItem('account.token.time'));
    this.loadGlobalAuthorizedActions((status: number) => {
      console.log("Authorized actions loaded")
    });

    this.settings.interceptresponse.subscribe((event) => {
      if (event.type && event.type === "token_expired") {
        AuthService.token = null;
        AuthService.tokenDeadline = null;
        AuthService.tokenCounter = null;
        AuthService.tokenTime = null;
        this.logout();
      }
    });
  }

  loadGlobalAuthorizedActions(callback: (number) => void) {
    this.getAuthorizedActions('uuid:1').subscribe((rAct: RightAction[]) => {
      this.authorizedGlobalActions = [];
      rAct.forEach(rA => {
        this.authorizedGlobalActions.push(rA.code);
      });
      callback(AuthService.GLOBAL_ACTIONS_LOADED);
    });
  }

  loadAuthorizedSpecificActions(pid: string, callback: (number) => void) {
    this.getAuthorizedActions(pid).subscribe((rAct: RightAction[]) => {
      let specActions = [];
      rAct.forEach(rA => {
        specActions.push(rA.code);
      });
      this.authorizedSpecificActions[pid]= specActions;
      callback(AuthService.SPECIFIC_ACTIONS_LOADED);
    });
    
  }
  

  baseUrl(): string {
    return location.origin + this.settings.deployPath;
  }

  login() {
    const redircetUri = `${this.baseUrl()}/keycloak`;
    let url = `${this.settings.clientApiBaseUrl}/user/auth/login?&redirect_uri=${redircetUri}`;
    window.open(url, '_top');
  }

  logout(suffix: string = "") {
    AuthService.token = null;
    AuthService.tokenTime = null;
    AuthService.tokenDeadline = null;
    AuthService.tokenCounter = null;

    localStorage.removeItem('account.token');
    localStorage.removeItem('account.token.time');
    this.user = null;

    const redircetUri = `${this.baseUrl()}${suffix}`;
    //let url = `${this.settings.keycloak.baseUrl}/realms/kramerius/protocol/openid-connect/logout`;
    let url = `${this.settings.clientApiBaseUrl}/user/auth/logout`;
    if (this.settings.keycloak.logoutUrl) {
      url = this.settings.keycloak.logoutUrl;
    }
    window.open(url, '_top');
  }

  isLoggedIn() {
    return this.user && this.user.isLoggedIn();
  }

  isAuthorized() {
    let flag = this.user && this.authorizedGlobalActions && this.authorizedGlobalActions.indexOf('a_admin_read') >=0; 
    if (flag) {
      return this.authorizedGlobalActions.indexOf("a_admin_read") >=0;
    }  
    //return true;  
    return false;
  }

  // return authorized actions
  getAuthorizedActions(pid: string) {
    return this.http.get(`${this.settings.clientApiBaseUrl}/user/actions?pid=${pid}`)
        .pipe(map(response => RightAction.fromJsonArray(response)));
  }


  getPidsAuthorizedActions(pids: string[], actions:string[]) {

    const payload = {
        pids: pids
    };

    if (actions) {
      payload['actions'] = actions;
    }

    return this.http.post(`${this.settings.clientApiBaseUrl}/user/pids_actions`, payload)
        .pipe(map(response => RightAction.fromPidsMap(response)));
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
      // load global actions
      this.loadGlobalAuthorizedActions((status:number)=> {
        if (this.isAuthorized()) {
          if (user.session) {
            // expirace tokenu
            if (user.session['expires_in'] && AuthService.tokenTime) {
              let dd:Date =  new Date(AuthService.tokenTime);
              dd.setSeconds(dd.getSeconds() + parseInt(user.session['expires_in']));
              AuthService.tokenCounter = parseInt(user.session['expires_in']);
              AuthService.tokenDeadline = dd;
            }
          }
          callback(AuthService.AUTH_AUTHORIZED);
        } else {
          callback(AuthService.AUTH_NOT_AUTHORIZED);
        }
      });
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
                AuthService.tokenTime = new Date();
                localStorage.setItem('account.token', token);
                localStorage.setItem('account.token.time', new Date().toISOString());
                this.checkToken(callback);
            }
        },
        (error) => {
            callback(AuthService.AUTH_NOT_LOGGED_IN);
        }
    );
  }

  private validateToken(): Observable<User> {
    return this.http.get(`${this.settings.clientApiBaseUrl}/user?sessionAttributes=true`)
        .pipe(map(response => User.fromJson(response)));
  }


  private logoutKramerius(): Observable<any> {
    return this.http.get(`${this.settings.clientApiBaseUrl}/user/logout`);
  }

  private getToken(code: string): Observable<string> {
    const redircetUri = `${this.baseUrl()}/keycloak`;
    // let url = `${this.settings.clientApiBaseUrl}/user/auth/login?&redirect_uri=${redircetUri}`;
    let url = `${this.settings.clientApiBaseUrl}/user/auth/token?code=${code}&redirect_uri=${redircetUri}`;
    return this.http.get(url).pipe(map(response => 
      response['access_token'])
    );

    /*
    let url = `${this.settings.keycloak.baseUrl}/realms/kramerius/protocol/openid-connect/token`;
    let checkTokenUrl = this.settings.keycloak.tokenUrl;
    if (checkTokenUrl) url = checkTokenUrl;
    
    const redircetUri = `${this.baseUrl()}/keycloak`;
    const body = `grant_type=authorization_code&code=${code}&client_id=${this.settings.keycloak.clientId}&client_secret=${this.settings.keycloak.secret}&redirect_uri=${redircetUri}`; 
    const options = {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        })
    };
    return this.http.post(url, body, options).pipe(map(response => 
      response['access_token'])
    );*/
  }
  
}