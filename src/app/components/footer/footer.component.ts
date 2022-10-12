import { Component, OnInit } from '@angular/core';
import { AppSettings } from 'src/app/services/app-settings';
import * as gitInfo from 'git-info.json'
import { AuthService } from 'src/app/services/auth.service';
import { AdminApiService } from 'src/app/services/admin-api.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  coreInfo:any;

  constructor(
    public appSettings: AppSettings,
    private adminApi: AdminApiService 
  ) { }

  ngOnInit(): void {
    this.getCoreInfo();
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

  getTokenDeadline() {
    if (AuthService.tokenDeadline) {
      function padTo2Digits(num: number) {
        return num.toString().padStart(2, '0');
      }
      return [
        padTo2Digits(AuthService.tokenDeadline.getHours()),
        padTo2Digits(AuthService.tokenDeadline.getMinutes()),
        padTo2Digits(AuthService.tokenDeadline.getSeconds()),
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
