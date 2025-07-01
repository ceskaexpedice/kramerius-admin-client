import { Component, OnInit } from '@angular/core';
import { AppSettings } from 'src/app/services/app-settings';
import * as gitInfo from 'git-info.json'
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from 'src/app/services/admin-api.service'; // pedro,
import { AuthService } from 'src/app/services/auth.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-about-dialog',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule,  MatDialogModule, FormsModule, MatSlideToggleModule,
    RouterModule, TranslateModule, MatMenuModule],
  templateUrl: './about-dialog.component.html',
  styleUrls: ['./about-dialog.component.scss']
})
export class AboutDialogComponent implements OnInit {

  coreInfo: any;

  constructor(
    public appSettings: AppSettings,
    private adminApi: AdminApiService, // pedro
    public auth: AuthService
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
    const info: any = gitInfo;
    //console.log(info)
    const hash = info.hash ? info.hash
      : info['default'].hash.substring(1); //pokud je to jeste v objektu "default", je hash prefixovan 'g', viz git-info.json (generovan pred buildem)
    //console.log(hash)
    return hash;
  }

   setWorkModeToMaintence() {
    this.adminApi.putWorkMode(this.appSettings.workModeRead).subscribe(res => {
      this.appSettings.workModeRead = res.readOnly;
      this.appSettings.workModeReason = res.reason;
      //console.log(res);
      this.auth.loadGlobalAuthorizedActions((status: number) => {
        console.log("Authorized actions loaded")
      });
    });
  }
}
