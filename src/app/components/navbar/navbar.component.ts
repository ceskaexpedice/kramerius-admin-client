import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { AppSettings } from 'src/app/services/app-settings';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  constructor(public auth: AuthService, public router: Router, public appSettings: AppSettings) { }

  ngOnInit() {
  }

  logout() {
    this.auth.logout(() => {
      this.router.navigate(['/']);
    });
  }


}
