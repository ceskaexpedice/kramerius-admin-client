import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  state: string; // none | loading | failure
  email: string;
  password: string;
  errorMessage: string;

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit() {
    this.state = 'none';
  }

  login() {
    if (!this.email) {
      this.errorMessage = 'Zadejte prosím uživatelské jméno';
      this.state = 'failure';
      return;
    }
    if (!this.password) {
      this.errorMessage = 'Zadejte prosím heslo';
      this.state = 'failure';
      return;
    }
    this.state = 'loading';
    this.auth.login(this.email, this.password, (status: string) => {
      console.log('login', status);
      if (status == 'authorized') {
        this.router.navigate(['/']);
      } else if (status == 'logged_in_not_authorized') {
        this.errorMessage = 'Nemáte dostatečné oprávnění';
        this.state = 'failure';
      } else if (status == 'not_logged_in') {
        this.errorMessage = 'Neplatné přihlašovací údaje';
        this.state = 'failure';
      } else {
        this.errorMessage = 'Přihlášení se nezdařilo';
        this.state = 'failure';
      }
    });
  }

  // loginWithGoogle() {
  //   this.auth.signInOAuth('google', () => {
  //     console.log('after loginWithGoogle');
  //   });
  // }


}
