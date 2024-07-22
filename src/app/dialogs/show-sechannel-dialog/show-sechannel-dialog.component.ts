import { Component, OnInit, Inject } from '@angular/core';
import { Data } from '@angular/router';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import { CdkApiService } from 'src/app/services/cdk-api.service';

@Component({
  selector: 'app-show-sechannel-dialog',
  templateUrl: './show-sechannel-dialog.component.html',
  styleUrls: ['./show-sechannel-dialog.component.scss']
})
export class ShowSeChannelDialogComponent implements OnInit {

  table:any = {};
  config:any;
  channel:any;
  acronym:any;

  constructor(@Inject(
    MAT_DIALOG_DATA) public data: any,     
    private cdkApi: CdkApiService
  ) { 
    this.acronym = data.code;
  }

  getRoles(userKey) {
    let retval = this.channel.users[userKey]?.roles;
    if (retval) {
      return retval;
    } else {
      return [];
    }
  }

  getLicenses(userKey) {
    let retval = this.channel.users[userKey]?.licenses;
    if (retval) {
      return retval;
    } else {
      return [];
    }
  }

  getUserKeys() {
    if (this.channel) {
      return Object.keys(this.channel.users);
    } else {
      return [];
    }
  }

  getLinkForLicense(lic) {
    return "https://github.com/ceskaexpedice/kramerius/wiki/Licence"
  }

  ngOnInit(): void {

    this.cdkApi.config(this.acronym).subscribe(resp=> {
      this.config = resp;
    });

    this.cdkApi.channel(this.acronym).subscribe(resp=> {
      this.channel = resp;
    });

  }
}
