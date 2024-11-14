import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from 'ngx-flexible-layout';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { RightsComponent } from './rights/rights.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { RolesComponent } from './roles/roles.component';
import { LicensesComponent } from './licenses/licenses.component';
import { ParamsComponent } from './params/params.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FlexLayoutModule, FormsModule,
    MatIconModule, MatTabsModule, 
    // MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressBarModule,
    // MatTooltipModule, MatTabsModule, MatDividerModule, MatSelectModule, 
    RightsComponent, RolesComponent, LicensesComponent, ParamsComponent ],
  selector: 'app-access',
  templateUrl: './access.component.html',
  styleUrls: ['./access.component.scss']
})
export class AccessComponent implements OnInit {

  view: string;

  constructor(
    private api: AdminApiService, 
    private local: LocalStorageService, 
    private router: Router) {}

  ngOnInit() {
    //this.view = this.local.getStringProperty('access.view');
    this.view = this.router.url.replace('/access/', '');
  }

  changeView(view: string) {
    this.view = view;
    this.local.setStringProperty('access.view', view);
    this.router.navigate(['/access/', view]);
  }
}
