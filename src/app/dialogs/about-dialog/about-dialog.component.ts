import { Component, OnInit } from '@angular/core';
import { AppSettings } from 'src/app/services/app-settings';
import * as gitInfo from 'git-info.json'

@Component({
  selector: 'app-about-dialog',
  templateUrl: './about-dialog.component.html',
  styleUrls: ['./about-dialog.component.scss']
})
export class AboutDialogComponent implements OnInit {

  coreInfo: any;

  constructor(
    public appSettings: AppSettings
  ) { }

  ngOnInit(): void {
    this.getCoreInfo();
  }

  getVersion() {
    return AppSettings.adminClientVersion;
  }


  getCoreInfo() {
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

  getAcronym() {
    if (this.coreInfo && this.coreInfo['instance'] && this.coreInfo['instance']['acronym']) {
      return this.coreInfo['instance']['acronym'];
    } else return null;
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
