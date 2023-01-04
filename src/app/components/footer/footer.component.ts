import { Component, OnInit } from '@angular/core';
import { AppSettings } from 'src/app/services/app-settings';
import * as gitInfo from 'git-info.json'
import { AuthService } from 'src/app/services/auth.service';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { interval, Subscription } from 'rxjs';


@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  coreInfo:any;
  
  tokenHours: string;
  tokenMinutes: string;
  tokenSeconds: string;
  

  constructor(
    public appSettings: AppSettings,
    private adminApi: AdminApiService 
  ) { }

  ngOnInit(): void {
    this.getCoreInfo();

    interval(1000).subscribe(x => {
      if (AuthService.tokenDeadline) {

        function getDifference(date1, date2) {
          const diffInMs = Math.abs(date2 - date1);
          return diffInMs;
        }

        let diffInMs = Math.round(getDifference(new Date(), AuthService.tokenDeadline)/1000);
        if (diffInMs > 0) {
          this.tokenHours = this.padTo2Digits( Math.trunc(diffInMs / (3600)));
          diffInMs =  diffInMs % 3600        
          this.tokenMinutes = this.padTo2Digits( Math.trunc(diffInMs / (60)));
          diffInMs =  diffInMs % 60        
          this.tokenSeconds = this.padTo2Digits( diffInMs);
        } else {
          this.tokenHours = this.padTo2Digits(0);
          this.tokenMinutes = this.padTo2Digits(0);
          this.tokenSeconds = this.padTo2Digits(0);
        }
      } else {
        this.tokenHours = null;
        this.tokenMinutes = null;
        this.tokenSeconds = null;
      }
    });
  }

  getVersion() {
    return this.appSettings.version;
  }


  getCoreInfo() {
    //this
    this.appSettings.getCoreInfo().subscribe(response => {
      this.coreInfo = response;
    });
  }

  getCoreVersion() {
    if (this.coreInfo && this.coreInfo['version']) {
      return this.coreInfo['version'];
    } else return null;
  }

  getCoreHashShort() {
    if (this.coreInfo && this.coreInfo['hash']) {
      return this.coreInfo['hash'].substring(0,5);
    } else return null;
  }

  getCoreHashFull() {
    if (this.coreInfo && this.coreInfo['hash']) {
      return this.coreInfo['hash'];
    } else return null;
  }

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

  getLastCommitHash() {
    const info = gitInfo;
    //console.log(info)
    const hash = info.hash ? info.hash
      : info['default'].hash.substring(1); //pokud je to jeste v objektu "default", je hash prefixovan 'g', viz git-info.json (generovan pred buildem)
    //console.log(hash)
    return hash;
  }

}
