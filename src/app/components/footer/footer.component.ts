import { Component, OnInit } from '@angular/core';
// import * as gitInfo from 'git-info.json'
import { AuthService } from '../../services/auth.service';
import { AdminApiService } from '../../services/admin-api.service';
import { interval, Subscription } from 'rxjs';
import { AppSettings } from '../../services/app-settings';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from 'ngx-flexible-layout';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TranslateModule, FlexLayoutModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  currentYear: number=new Date().getFullYear();

  coreInfo:any;
  
  tokenHours: string;
  tokenMinutes: string;
  tokenSeconds: string;
  

  constructor(
    public appSettings: AppSettings,
    private adminApi: AdminApiService
  ) { }

  ngOnInit(): void {}

  private padTo2Digits(num: number) {
    return num.toString().padStart(2, '0');
  }

  getTokenDeadline() {
    if (AuthService.tokenDeadline) {
      return [
        this.padTo2Digits(AuthService.tokenDeadline.getHours()),
        this.padTo2Digits(AuthService.tokenDeadline.getMinutes()),
        this.padTo2Digits(AuthService.tokenDeadline.getSeconds()),
      ].join(':')
    } else return '';
  }

}
