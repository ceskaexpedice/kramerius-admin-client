import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AppSettings } from 'src/app/services/app-settings';
import * as gitInfo from 'git-info.json'
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule,  MatCardModule,
    RouterModule, TranslateModule, MatTooltipModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  errorMessage: string = '';

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
        this.errorMessage = '1';
      } else if (failureStatus == '2') {
        this.errorMessage = '2';
      } else if (failureStatus == '3') {
        this.errorMessage = '3';
      }
    });
  }

  login() {
    this.auth.login();
  }

  getVersion() {
    return AppSettings.adminClientVersion;
  }

  getLastCommitHash() {
    const info: any = gitInfo;
    //console.log(info)
    const hash = info.hash ? info.hash
      : info['default'].hash.substring(1); //pokud je to jeste v objektu "default", je hash prefixovan 'g', viz git-info.json (generovan pred buildem)
    //console.log(hash)
    return hash;
  }

}
