import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { AdminApiService } from 'src/app/services/admin-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatTooltipModule, MatFormFieldModule, MatInputModule
  ],
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit {

  constructor(private adminApi: AdminApiService) { }

  propertiesLoadingNow: string[] = [];
  propertiesSavingNow: string[] = [];
  properties: any = {} //key:value

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loadValue('texts.rightMsg.cs');
    this.loadValue('texts.rightMsg.en');
    this.loadValue('pdfMaxRange');
    this.loadValue('processQueue.activeProcess');
  }

  loadValue(key: string) {
    this.setLoadingNow(key, true);
    this.adminApi.getConfigProperty(key).subscribe(result => {
      console.log('loaded ' + key + ": " + result[key])
      this.properties[key] = result[key];
      this.setLoadingNow(key, false);
    })
  }

  saveValue(key: string) {
    this.setSavingNow(key, true);
    this.adminApi.setConfigProperty(key, String(this.properties[key])).subscribe(result => {
      this.setSavingNow(key, false);
    })
  }

  updateValue(key: string, value: string) {
    this.adminApi.setConfigProperty(key, value).subscribe(result => {
    })
  }

  setLoadingNow(key: string, loading: boolean) {
    if (loading) {
      this.propertiesLoadingNow.push(key);
    } else {
      const index = this.propertiesLoadingNow.indexOf(key);
      if (index != -1) {
        this.propertiesLoadingNow.splice(index, 1);
      }
    }
  }

  isLoadingNow(key: string) {
    return this.propertiesLoadingNow.includes(key);
  }

  setSavingNow(key: string, loading: boolean) {
    if (loading) {
      this.propertiesSavingNow.push(key);
    } else {
      const index = this.propertiesSavingNow.indexOf(key);
      if (index != -1) {
        this.propertiesSavingNow.splice(index, 1);
      }
    }
  }

  isSavingNow(key: string) {
    return this.propertiesSavingNow.includes(key);
  }

  isLoadingOrSavingSomething() {
    return this.propertiesLoadingNow.length != 0 || this.propertiesSavingNow.length != 0;
  }

}
