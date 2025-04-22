import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { LocalStorageService } from 'src/app/services/local-storage.service';
import { CdkProxyComponent } from './cdk-proxy/cdk-proxy.component';
import { CdkObjectReharvestComponent } from './cdk-object-reharvest/cdk-object-reharvest.component';
import { CdkEuropeanouComponent } from './cdk-europeanou/cdk-europeanou.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule,
    MatIconModule, MatTooltipModule, MatTabsModule,
    CdkProxyComponent, CdkObjectReharvestComponent, CdkEuropeanouComponent
  ],
  selector: 'app-cdk',
  templateUrl: './cdk.component.html',
  styleUrls: ['./cdk.component.scss']
})
export class CdkComponent implements OnInit {
  view: string;

  constructor(
    private router: Router,
    private local: LocalStorageService
  ) { }

  ngOnInit(): void {
    this.view = this.local.getStringProperty('cdk.view');
  }

  changeView(view: string) {
    this.view = view;
    this.local.setStringProperty('cdk.view', view);
    this.router.navigate(['/cdk/', view]);
  }
}
