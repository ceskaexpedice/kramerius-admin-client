import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { AppSettings } from 'src/app/services/app-settings';
import { UIService } from 'src/app/services/ui.service';
import { RightAction } from 'src/app/models/right-action.model';
import { AppState } from 'src/app/app-state';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  // to test accesibility
  notAllowed: boolean = false;


  constructor(
    public auth: AuthService, 
    private router: Router, 
    public settings: AppSettings, 
    public ui: UIService,
    public appSettings: AppSettings,
    public appState: AppState
    ) { }

  ngOnInit() {
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

  getVersion() {
    return this.appSettings.version;
  }

}
