import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Component({
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
