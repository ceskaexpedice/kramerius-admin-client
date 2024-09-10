import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSettings } from 'src/app/services/app-settings';
import { UIService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-cdk-collection-new',
  templateUrl: './cdk-collection-new.component.html',
  styleUrls: ['./cdk-collection-new.component.scss']
})
export class CdkCollectionNewComponent implements OnInit {

  //lang: string;

  // all configured languages
  public languages = this.appSettings.languages;

  public lang: string = 'cs';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private appSettings: AppSettings,
    private uiService: UIService
  ) { }

  ngOnInit(): void {
    //this.lang = this.uiService.currentLang;
  }

  getCurrentRoute(type: string) {
    if (type === 'string') {
      return this.router.url.replace('/object/', '');
    } else {
      return this.router.url;
    }
  }

  setLang(lang) {
    this.lang = lang;
  }

}
