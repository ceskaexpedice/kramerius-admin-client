import { Component, OnInit } from '@angular/core';
import { AppSettings } from 'src/app/services/app-settings';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private settings: AppSettings,
    private local: LocalStorageService
  ) { }

    public dashBoard = this.settings.homeDashboard;

  ngOnInit() {
    
  }

  setDefaultRoute(type: string, value: string) {
    this.local.setStringProperty(type, value);
  }
}
