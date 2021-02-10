import { Component, OnInit } from '@angular/core';
import { AdminApiService } from 'src/app/services/admin-api.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit {

  constructor(private adminApi: AdminApiService) { }

  propertiesLoadingNow = [];
  propertiesSavingNow = [];
  properties = {} //key:value

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loadValue('texts.rightMsg.cs');
    this.loadValue('texts.rightMsg.en');
    this.loadValue('pdfMaxRange');
    this.loadValue('processQueue.activeProcess');
  }

  loadValue(key) {
    this.setLoadingNow(key, true);
    this.adminApi.getConfigProperty(key).subscribe(result => {
      console.log('loaded ' + key + ": " + result[key])
      this.properties[key] = result[key];
      this.setLoadingNow(key, false);
    })
  }

  saveValue(key) {
    this.setSavingNow(key, true);
    this.adminApi.setConfigProperty(key, String(this.properties[key])).subscribe(result => {
      this.setSavingNow(key, false);
    })
  }

  updateValue(key, value: string) {
    this.adminApi.setConfigProperty(key, value).subscribe(result => {
    })
  }

  setLoadingNow(key, loading: boolean) {
    if (loading) {
      this.propertiesLoadingNow.push(key);
    } else {
      const index = this.propertiesLoadingNow.indexOf(key);
      if (index != -1) {
        this.propertiesLoadingNow.splice(index, 1);
      }
    }
  }

  isLoadingNow(key) {
    return this.propertiesLoadingNow.includes(key);
  }

  setSavingNow(key, loading: boolean) {
    if (loading) {
      this.propertiesSavingNow.push(key);
    } else {
      const index = this.propertiesSavingNow.indexOf(key);
      if (index != -1) {
        this.propertiesSavingNow.splice(index, 1);
      }
    }
  }

  isSavingNow(key) {
    return this.propertiesSavingNow.includes(key);
  }

  isLoadingOrSavingSomething() {
    return this.propertiesLoadingNow.length != 0 || this.propertiesSavingNow.length != 0;
  }

}
