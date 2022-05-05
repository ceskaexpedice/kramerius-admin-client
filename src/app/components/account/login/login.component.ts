import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  errorMessage: string;

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
    ) { }

  ngOnInit() {
    if (this.auth.isAuthorized()) {
      this.router.navigate(['/']);
      return;
    }
    this.route.queryParamMap.subscribe(params => {
      const failureStatus = params.get('failure');
      if (failureStatus == '1') {
        this.errorMessage = 'Nedostatečná oprávnění';
      } else if (failureStatus == '2') {
        this.errorMessage = 'Přihlášení se nezdařilo';
      }
    });
  }

  login() {
    this.auth.login();
  }

}
