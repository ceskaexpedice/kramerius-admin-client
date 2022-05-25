import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AppSettings } from 'src/app/services/app-settings';
import * as gitInfo from 'git-info.json'

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
    private router: Router,
    public appSettings: AppSettings
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

  getVersion() {
    return this.appSettings.version;
  }

  getLastCommitHash() {
    const info = gitInfo;
    //console.log(info)
    const hash = info.hash ? info.hash
      : info['default'].hash.substring(1); //pokud je to jeste v objektu "default", je hash prefixovan 'g', viz git-info.json (generovan pred buildem)
    //console.log(hash)
    return hash;
  }

}
