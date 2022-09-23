import { Component, OnInit } from '@angular/core';
import { AppSettings } from 'src/app/services/app-settings';
import * as gitInfo from 'git-info.json'

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  constructor(
    public appSettings: AppSettings
  ) { }

  ngOnInit(): void {
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
