import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { AppSettings } from 'src/app/services/app-settings';
import { UIService } from 'src/app/services/ui.service';
import { RightAction } from 'src/app/models/right-action.model';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { interval, Subscription } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AboutDialogComponent } from 'src/app/dialogs/about-dialog/about-dialog.component';
import { UserInfoDialogComponent } from 'src/app/dialogs/user-info-dialog/user-info-dialog.component';
import { CommonModule } from '@angular/common';


import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminApiService } from 'src/app/services/admin-api.service'; // pedro


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule,  MatDialogModule,
    RouterModule, TranslateModule, MatMenuModule, MatTooltipModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  // to test accesibility
  notAllowed: boolean = false;
  cdkMode: boolean;

  tokenHours: string;
  tokenMinutes: string;
  tokenSeconds: string;

  workModeRead: boolean;
  workModeReadClass: string = 'app-workmode-readOnly';
  workModeReason: string;

  public languages: string[];
  
  constructor(
    public auth: AuthService, 
    private router: Router, 
    public settings: AppSettings, 
    public ui: UIService,
    public appSettings: AppSettings,
    private local: LocalStorageService,
    public dialog: MatDialog,
    private adminApi: AdminApiService, // pedro
    ) { 
      this.cdkMode = settings.cdkMode;
      this.languages = appSettings.languages;
    }

  ngOnInit():void  {
    interval(1000).subscribe(x => {
      if (AuthService.tokenDeadline) {

        function getDifference(date1: any, date2: any) {
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
          let time = this.tokenHours+":"+this.tokenMinutes+":"+this.tokenSeconds;
          if(time === '00:02:00') {
            this.ui.showAlertSnackBar('snackbar.alert.tokenTimeExpireInfo');
          }
        } else {
          this.tokenHours = this.padTo2Digits(0);
          this.tokenMinutes = this.padTo2Digits(0);
          this.tokenSeconds = this.padTo2Digits(0);
          window.location.href='/login';
        }
      } else {
        this.tokenHours = null;
        this.tokenMinutes = null;
        this.tokenSeconds = null;
      }
    });

    // call api to return workmode endpoint
    this.adminApi.getWorkMode().subscribe(res => {
      this.workModeRead = res.readOnly;
      this.workModeReason = res.reason;
      //console.log(this.workModeRead);
    });

    
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


  allowedGlobalAction(name:string) {
    if (this.auth.authorizedGlobalActions) {
      let retval = this.auth.authorizedGlobalActions.indexOf(name) >= 0;
      return retval;
    } else return false;
  }
  logout() {
    this.auth.logout();
  }

  changeLang(lang: string) {
    this.ui.changeLang(lang);
  }

  setDefaultRoute(type: string, value: string) {
    this.local.setStringProperty(type, value);
  }

  openAboutDialog() {
    const dialogRef = this.dialog.open(AboutDialogComponent, {
      panelClass: 'app-about-dialog',
      width: '600px'
    });
  }

  openUserInfoDialog() {
    const dialogRef = this.dialog.open(UserInfoDialogComponent, {
      panelClass: 'app-user-info-dialog',
      width: '600px'
    });
  }
}
