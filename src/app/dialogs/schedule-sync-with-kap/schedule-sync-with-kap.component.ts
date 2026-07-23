import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-schedule-sync-with-kap',
  imports: [
    MatDialogModule, MatButtonModule, MatIconModule, TranslateModule, MatTableModule, MatTooltipModule
  ],
  templateUrl: './schedule-sync-with-kap.component.html',
  styleUrl: './schedule-sync-with-kap.component.scss',
})
export class ScheduleSyncWithKapComponent {
  applyChanges() {
    // todo
  }
}
