import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { AppSettings } from 'src/app/services/app-settings';
import { UIService } from 'src/app/services/ui.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  constructor(
    public auth: AuthService, 
    private router: Router, 
    public settings: AppSettings, 
    public ui: UIService,
    public appSettings: AppSettings
    ) { }

  ngOnInit() {
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
