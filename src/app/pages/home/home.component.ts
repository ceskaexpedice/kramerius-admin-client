import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppSettings } from 'src/app/services/app-settings';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule,  MatCardModule,
    RouterModule, TranslateModule, MatTooltipModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    public dashBoard: any;
  constructor(
    private settings: AppSettings,
    private local: LocalStorageService
  ) {  }


  ngOnInit() {
    this.dashBoard = this.settings.homeDashboard
  }

  setDefaultRoute(type: string, value: string) {
    this.local.setStringProperty(type, value);
  }
}
