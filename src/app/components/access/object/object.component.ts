import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';


@Component({
  templateUrl: './object.component.html',
  styleUrls: ['./object.component.scss']
})
export class ObjectComponent implements OnInit {

  view: string;
  pid: string;
  inputPid: string;
  errorMessage: string;

  constructor(
    private local: LocalStorageService,
    private router: Router,
    private route: ActivatedRoute,
    private adminApi: AdminApiService,
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.pid = params['pid'];
      if (!!this.pid) {
        this.loadData();
      }
      //this.view = this.local.getStringProperty('object.view', 'rights');
    });
  }

  loadData() {
    this.errorMessage = undefined;
    //TODO: loader
    //existuje:  uuid:7f064634-d405-4774-912d-8c701554e5de
    //neexistuje: uuid:7f064634-xxxx-4774-912d-8c701554e5de
    console.log(this.pid)
    console.log(this.inputPid);
    this.adminApi.checkObject(this.pid).subscribe(result => {
      console.log('object found')
      this.view = this.local.getStringProperty('object.view', 'rights');
      console.log(result);
    }, error => {
      if (error.status == 400) {
        this.errorMessage = `neplatný PID ${this.pid}`;
      } else if (error.status == 404) {
        this.errorMessage = `nenalezen objekt ${this.pid} `;
      } else if (error.status == 403) {
        this.errorMessage = `nedostatečná přístupová práva k objektu ${this.pid} `;
      } else {
        this.errorMessage = `chyba čtení z repozitáře pro objekt ${this.pid}: ${error.status}: ${error.message}`;
      }
    })
  }

  changeView(view: string) {
    this.view = view;
    this.local.setStringProperty('object.view', view);
  }

  assignUuid() {
    if (!this.inputPid) {
      return;
    }
    this.router.navigate(['/', 'object', this.inputPid]);
  }

  getCurrentRoute(type: string) {
    if (type === 'string') {
      return this.router.url.replace('/object/', '');
    } else {
      return this.router.url;
    }
  }

}


