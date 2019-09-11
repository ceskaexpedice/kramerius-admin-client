import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  templateUrl: './omniauth.component.html'
})
export class OmniauthComponent implements OnInit {

  constructor(private router: Router,
    private account: AuthService) {}


  ngOnInit() {
    this.account.processOAuthCallback((success) => {
      if (success) {
        this.router.navigate(['/']);
      }
    });
  }

}
