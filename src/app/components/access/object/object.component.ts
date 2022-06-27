import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { UIService } from 'src/app/services/ui.service';


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
    private dialog: MatDialog,
    private ui: UIService,
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
    this.adminApi.checkObject(this.pid).subscribe(result => {
      this.pidIsCorrect = true;
      this.view = this.local.getStringProperty('object.view', 'other');
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

  deleteObjectFromRepo() {
    const data: SimpleDialogData = {
      title: "Smazání objektu (nízkoúrovňově)",
      message: "Opravdu chcete objekt trvale smazat? Objekt bude smazán z repozitáře i vyhledávácího indexu. " +
        "Nebudou ale aktualizovány odkazy na tento objekt z jiných objektů, nebudou mazány ani další odkazované objekty.",
      btn1: {
        label: 'Ano',
        value: 'yes',
        color: 'warn'
      },
      btn2: {
        label: 'Ne',
        value: 'no',
        color: 'light'
      }
    };
    const dialogRef = this.dialog.open(SimpleDialogComponent, {
      data: data,
      width: '600px',
      panelClass: 'app-simple-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.adminApi.deleteObject(this.pid).subscribe(result => {
          this.ui.showInfoSnackBar("Objekt byl smazán");
          this.router.navigate(['/object']);
        }, (error) => {
          console.log(error);
          this.ui.showErrorSnackBar("Objekt se nepodařilo smazat")
        });
      }
    });
  }

  deleteObjectTreeWithProcess() {
    //TODO: implement after process has been tested on backend
  }

}


