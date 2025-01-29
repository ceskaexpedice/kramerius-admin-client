import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MonitoringApiComponent } from "./monitoring-api/monitoring-api.component";
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [CommonModule, MonitoringApiComponent, TranslateModule, MatIconModule, MatTabsModule],
  templateUrl: './monitoring.component.html',
  styleUrl: './monitoring.component.scss'
})
export class MonitoringComponent {
  view: string;

   constructor(
      private local: LocalStorageService, 
      private router: Router) {}
  
    ngOnInit() {
      //this.view = this.router.url.replace('/monitoring/', '');
      this.view = this.local.getStringProperty('monitoring.view');
    }

  changeView(view: string) {
    this.view = view;
    this.local.setStringProperty('monitoring.view', view);
    this.router.navigate(['/monitoring/', view]);
  }
}
