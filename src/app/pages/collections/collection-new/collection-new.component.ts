import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from 'ngx-flexible-layout';
import { AppSettings } from 'src/app/services/app-settings';
import { UIService } from 'src/app/services/ui.service';
import { CollectionEditComponent } from '../collection-edit/collection-edit.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FlexLayoutModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatMenuModule,
    MatTooltipModule, CollectionEditComponent
  ],
  selector: 'app-collection-new',
  templateUrl: './collection-new.component.html',
  styleUrls: ['./collection-new.component.scss']
})
export class CollectionNewComponent implements OnInit {

  //lang: string;

  // all configured languages
  public languages: string[];

  public lang: string = 'cs';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private appSettings: AppSettings,
    private uiService: UIService
  ) { }

  ngOnInit(): void {
    this.languages = this.appSettings.languages;
    //this.lang = this.uiService.currentLang;
  }

  getCurrentRoute(type: string) {
    if (type === 'string') {
      return this.router.url.replace('/object/', '');
    } else {
      return this.router.url;
    }
  }

  setLang(lang: string) {
    this.lang = lang;
  }

}
