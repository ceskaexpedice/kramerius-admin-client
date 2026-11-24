import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AdminApiService } from 'src/app/services/admin-api.service';

@Component({
  selector: 'app-keycloak-users',
  imports: [DatePipe, FormsModule, TranslateModule, MatTableModule, MatFormFieldModule, MatInputModule, MatSelectModule,
            MatButtonModule, MatIconModule, MatCardModule, MatProgressBarModule],
  templateUrl: './keycloak-users.component.html',
  styleUrls: ['./keycloak-users.component.scss']
})
export class KeycloakUsersComponent implements OnInit {

  columns = ['username', 'name', 'email', 'enabled', 'created', 'lastLogin'];
  pageSizes = [20, 50, 100];

  users: any[] = [];
  search = '';
  first = 0;
  pageSize = 20;
  hasMore = false;
  state: 'loading' | 'success' | 'error' = 'loading';
  errorMessage: string;

  constructor(private api: AdminApiService) {}

  ngOnInit() {
    this.load();
  }

  onSearch() {
    this.first = 0;
    this.load();
  }

  onPageSize() {
    this.first = 0;
    this.load();
  }

  onPrev() {
    this.first = Math.max(0, this.first - this.pageSize);
    this.load();
  }

  onNext() {
    this.first += this.pageSize;
    this.load();
  }

  load() {
    this.state = 'loading';
    this.api.searchKeycloakUsers(this.search, this.first, this.pageSize).subscribe({
      next: (res: any) => {
        this.users = res.users || [];
        this.hasMore = !!res.hasMore;
        this.state = 'success';
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.error?.message || error.message;
        this.state = 'error';
      }
    });
  }
}
