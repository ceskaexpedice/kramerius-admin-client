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
  pidIsCorrect = false;
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
    this.inputPid = this.pid;
    //TODO: loader
    //existuje:  uuid:495c089c-22c4-43fe-a4c3-1e7b4147834b
    //neexistuje: uuid:7f064634-xxxx-4774-912d-8c701554e5de
    console.log(this.pid)
    console.log(this.inputPid);
    this.adminApi.checkObject(this.pid).subscribe(result => {
      console.log('object found')
      this.pidIsCorrect = true;
      this.view = this.local.getStringProperty('object.view', 'rights');
      console.log(result);
    }, error => {
      this.pidIsCorrect = false;
      if (error.status == 400) {
        this.errorMessage = `neplatné UUID`;
      } else if (error.status == 404) {
        this.errorMessage = `objekt nenalezen`;
      } else if (error.status == 403) {
        this.errorMessage = `nedostatečná přístupová práva`;
      } else {
        this.errorMessage = `chyba čtení z repozitáře: ${error.status}: ${error.message}`;
      }
    })
  }

  correctPid() {
    return this.pid && this.pidIsCorrect;
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


