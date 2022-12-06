import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Component({
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
