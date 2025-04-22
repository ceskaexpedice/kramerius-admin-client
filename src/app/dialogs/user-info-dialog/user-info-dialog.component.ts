import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-user-info-dialog',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule,  MatDialogModule,
    RouterModule, TranslateModule, MatDividerModule],
  templateUrl: './user-info-dialog.component.html',
  styleUrls: ['./user-info-dialog.component.scss']
})
export class UserInfoDialogComponent implements OnInit {

  public userInfo: User ;

  constructor(
    public auth: AuthService
  ) { }

  ngOnInit(): void {
    this.userInfo = this.auth.user
  }
}
