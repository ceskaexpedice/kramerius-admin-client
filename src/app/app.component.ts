import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { AppSettings } from './services/app-settings';
import { AuthService } from './services/auth.service';
import { UIService } from './services/ui.service';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  constructor(
    private ui: UIService,
    private route: ActivatedRoute,
    private router: Router,
    private settings: AppSettings,
    public auth: AuthService
  ) { }

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
