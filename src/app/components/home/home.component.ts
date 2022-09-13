import { Component, OnInit } from '@angular/core';
import { AppSettings } from 'src/app/services/app-settings';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private settings: AppSettings) { }

    public test = this.settings.homneDashboard;

  ngOnInit() {
    
  }
}
