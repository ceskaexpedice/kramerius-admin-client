import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-monitoring-api-detail',
  standalone: true,
  imports: [MatDialogModule, TranslateModule, MatButtonModule],
  templateUrl: './monitoring-api-detail.component.html',
  styleUrl: './monitoring-api-detail.component.scss'
})
export class MonitoringApiDetailComponent {

}
