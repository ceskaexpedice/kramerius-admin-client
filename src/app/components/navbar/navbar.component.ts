import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { AppSettings } from 'src/app/services/app-settings';
import { UIService } from 'src/app/services/ui.service';
import { RightAction } from 'src/app/models/right-action.model';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { interval, Subscription } from 'rxjs';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  // to test accesibility
  notAllowed: boolean = false;
  cdkMode = this.settings.cdkMode;

  tokenHours: string;
  tokenMinutes: string;
  tokenSeconds: string;
  
  constructor(
    public auth: AuthService, 
    private router: Router, 
    public settings: AppSettings, 
    public ui: UIService,
    public appSettings: AppSettings,
    private local: LocalStorageService
    ) { }

  ngOnInit():void  {
    interval(1000).subscribe(x => {
      if (AuthService.tokenDeadline) {

        function getDifference(date1, date2) {
          const diffInMs = Math.abs(date2 - date1);
          return diffInMs;
        }

        let diffInMs = Math.round(getDifference(new Date(), AuthService.tokenDeadline)/1000);
        if (diffInMs > 0) {
          this.tokenHours = this.padTo2Digits( Math.trunc(diffInMs / (3600)));
          diffInMs =  diffInMs % 3600        
          this.tokenMinutes = this.padTo2Digits( Math.trunc(diffInMs / (60)));
          diffInMs =  diffInMs % 60        
          this.tokenSeconds = this.padTo2Digits( diffInMs);
        } else {
          this.tokenHours = this.padTo2Digits(0);
          this.tokenMinutes = this.padTo2Digits(0);
          this.tokenSeconds = this.padTo2Digits(0);
          window.location.href='/login';
        }
      } else {
        this.tokenHours = null;
        this.tokenMinutes = null;
        this.tokenSeconds = null;
      }
    });
  }

  private padTo2Digits(num: number) {
    return num.toString().padStart(2, '0');
  }

  getTokenDeadline() {
    if (AuthService.tokenDeadline) {
      return [
        this.padTo2Digits(AuthService.tokenDeadline.getHours()),
        this.padTo2Digits(AuthService.tokenDeadline.getMinutes()),
        this.padTo2Digits(AuthService.tokenDeadline.getSeconds()),
      ].join(':')
    } else return '';
  }


  allowedGlobalAction(name:string) {
    if (this.auth.authorizedGlobalActions) {
      let retval = this.auth.authorizedGlobalActions.indexOf(name) >= 0;
      return retval;
    } else return false;
  }
  logout() {
    this.auth.logout();
  }

  changeLang(lang: string) {
    this.ui.changeLang(lang);
  }

  setDefaultRoute(type: string, value: string) {
    this.local.setStringProperty(type, value);
  }

}
