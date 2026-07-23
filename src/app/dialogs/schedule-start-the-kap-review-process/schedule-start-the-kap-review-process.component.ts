import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-schedule-start-the-kap-review-process',
  imports: [
    MatDialogModule, MatCardModule, MatIconModule, TranslateModule, MatButtonModule
  ],
  templateUrl: './schedule-start-the-kap-review-process.component.html',
  styleUrl: './schedule-start-the-kap-review-process.component.scss',
})
export class ScheduleStartTheKapReviewProcessComponent {
  info:any ={};

  startsyncProcess() {
    // to do
  }
}
