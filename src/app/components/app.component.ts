import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AppSettings } from '../services/app-settings';
import { UIService } from '../services/ui.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    private ui: UIService,
    private route: ActivatedRoute,
    private router: Router,
    private settings: AppSettings,
    public auth: AuthService
  ) {}
  
  ngOnInit() {

    /** Handle language */
    this.ui.changeLang(this.settings.defaultLang);

    this.router.events.subscribe(val => {
      if (val instanceof NavigationEnd) {
        const params = this.route.snapshot.queryParamMap;
        if (params.has('lang')) {
          this.ui.changeLang(params.get('lang'));
        } else if (localStorage.getItem('lang')) {
          this.ui.changeLang(localStorage.getItem('lang'));
        }
      }
    });
  }
}
