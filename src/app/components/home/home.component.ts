import { Component, OnInit } from '@angular/core';
import { AppSettings } from 'src/app/services/app-settings';
import * as gitInfo from 'git-info.json'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private appSettings: AppSettings) { }

  ngOnInit() {
  }

  getVersion() {
    return this.appSettings.version;
  }

  getUserClientUrl() {
    return this.appSettings.userClientBaseUrl;
  }

  getCoreUrl() {
    return this.appSettings.coreBaseUrl;
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
