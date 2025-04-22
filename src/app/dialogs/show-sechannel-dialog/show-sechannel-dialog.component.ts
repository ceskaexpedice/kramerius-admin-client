import { Component, OnInit, Inject } from '@angular/core';
import { Data } from '@angular/router';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import { CdkApiService } from 'src/app/services/cdk-api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, MatDialogModule,
    MatButtonModule, MatIconModule,
    MatTooltipModule],
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

  getRoles(userKey: string) {
    let retval = this.channel.users[userKey]?.roles;
    if (retval) {
      return retval;
    } else {
      return [];
    }
  }

  getLicenses(userKey: string) {
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

  getLinkForLicense() {
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
