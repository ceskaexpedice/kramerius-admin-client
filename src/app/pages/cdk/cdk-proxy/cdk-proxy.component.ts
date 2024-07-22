import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ShowMappingDialogComponent } from 'src/app/dialogs/show-mapping-dialog/show-mapping-dialog.component';
import { ShowSeChannelDialogComponent } from 'src/app/dialogs/show-sechannel-dialog/show-sechannel-dialog.component';
import { Library } from 'src/app/models/cdk.library.model';
import { CdkApiService } from 'src/app/services/cdk-api.service';

@Component({
  selector: 'app-cdk-proxy',
  templateUrl: './cdk-proxy.component.html',
  styleUrls: ['./cdk-proxy.component.scss']
})
export class CdkProxyComponent implements OnInit {

  /** mock data  */
  debug = false;
  registrMock:any = [{
    "id": 23,
    "code": "uzei",
    "sigla": "ABA009",
    "name": "Knihovna Antonína Švehly",
    "name_en": "Library of Antonín Švehla",
    "alive": true,
    "last_state_switch": "2022-12-02T13:20:07.513Z",
    "state_duration": 343304,
    "version": "5.7.2",
    "url": "https://kramerius.uzei.cz",
    "new_client_url": "https://dk.uzei.cz",
    "new_client_version": "2.3.5",
    "logo": "https://api.registr.digitalniknihovna.cz/libraries/uzei/logo",
    "email": null,
    "web": "http://www.knihovnasvehly.cz",
    "street": "Slezská 7",
    "city": "Praha 2",
    "zip": "120 00",
    "latitude": 50.07606667,
    "longitude": 14.43860833,
    "collections": 0,
    "recommended_all": 2,
    "recommended_public": 2,
    "documents_all": 2969,
    "documents_public": 2885
  },
  {
    "id": 4,
    "code": "svkul",
    "sigla": "ULG001",
    "name": "Severočeská vědecká knihovna v Ústí nad Labem",
    "name_en": "The North Bohemian Research Library in Ústí nad Labem",
    "alive": true,
    "last_state_switch": "2022-11-22T21:36:11.940Z",
    "state_duration": 1177540,
    "version": "5.7.2",
    "url": "https://kramerius.svkul.cz",
    "new_client_url": null,
    "new_client_version": null,
    "logo": "https://api.registr.digitalniknihovna.cz/libraries/svkul/logo",
    "email": "maly@svkul.cz",
    "web": "http://www.svkul.cz",
    "street": "W. Churchilla 3",
    "city": "Ústí nad Labem",
    "zip": "400 01",
    "latitude": 50.6631697,
    "longitude": 14.0354472,
    "collections": 2,
    "recommended_all": 18,
    "recommended_public": 13,
    "documents_all": 1055,
    "documents_public": 167,
    "pages_all": 538360,
    "pages_public": 119881,
    "created_at": "2016-10-23T13:50:30.164Z",
    "updated_at": "2022-11-22T21:36:11.942Z",
    "last_document_at": "2022-06-20T12:35:52.377Z",
    "last_document_before": 169,
    "licenses": []
  },
  {
    "id": 43,
    "code": "kkp",
    "sigla": "PAG001",
    "name": "Krajská knihovna v Pardubicích",
    "name_en": "Regional Library in Pardubice",
    "alive": true,
    "last_state_switch": "2022-11-21T17:18:28.384Z",
    "state_duration": 1279403,
    "version": "5.7.3",
    "url": "https://kramerius.knihovna-pardubice.cz",
    "new_client_url": "https://kramerius.knihovna-pardubice.cz",
    "new_client_version": "2.3.5",
    "logo": "https://api.registr.digitalniknihovna.cz/libraries/kkp/logo",
    "email": null,
    "web": "https://kkpce.cz",
    "street": "Pernštýnské nám. 77",
    "city": "Pardubice",
    "zip": "53094",
    "latitude": 50.0381814,
    "longitude": 15.7781661,
    "collections": 0,
    "recommended_all": 0,
    "recommended_public": 0,
    "documents_all": 56,
    "documents_public": 31,
    "pages_all": 129024,
    "pages_public": 13033,
    "created_at": "2019-10-06T23:10:25.737Z",
    "updated_at": "2022-11-21T17:18:28.385Z",
    "last_document_at": "2021-11-11T06:11:15.947Z",
    "last_document_before": 390,
    "licenses": []
  },
  {
    "id": 5,
    "code": "knav",
    "sigla": "ABA007",
    "name": "Knihovna Akademie věd ČR",
    "name_en": "Library of the Czech Academy of Sciences",
    "alive": true,
    "last_state_switch": "2022-12-01T20:28:40.594Z",
    "state_duration": 403991,
    "version": "5.8.1",
    "url": "https://kramerius.lib.cas.cz",
    "new_client_url": "https://kramerius.lib.cas.cz",
    "new_client_version": "2.3.9",
    "logo": "https://api.registr.digitalniknihovna.cz/libraries/knav/logo",
    "email": null,
    "web": "http://www.knav.cz",
    "street": "Národní 3",
    "city": "Praha 1",
    "zip": "115 22",
    "latitude": 50.08142778,
    "longitude": 14.41385556,
    "collections": 79,
    "recommended_all": 15,
    "recommended_public": 15,
    "documents_all": 7665,
    "documents_public": 2929,
    "pages_all": 4500317,
    "pages_public": 1981527,
    "created_at": "2016-10-23T13:50:30.168Z",
    "updated_at": "2022-12-05T21:01:36.791Z",
    "last_document_at": "2022-12-05T10:22:36.929Z",
    "last_document_before": 1,
    "licenses": [{
      "id": "dnnto",
      "count": 1713156
    }, {
      "id": "dnntt",
      "count": 87125
    }, {
      "id": "knav_pracovisteAV",
      "count": 2089
    }, {
      "id": "knav_ustav_BU",
      "count": 1261
    }]
  },
  {
    "id": 49,
    "code": "k7test",
    "sigla": null,
    "name": "MZK - testovací instalace K7",
    "name_en": "MZK - test installation of K7",
    "alive": true,
    "last_state_switch": "2022-12-06T12:40:11.086Z",
    "state_duration": 101,
    "version": "7.0.3",
    "url": "https://k7-test.mzk.cz",
    "new_client_url": "https://k7-test.mzk.cz",
    "new_client_version": "2.3.9",
    "logo": "https://api.registr.digitalniknihovna.cz/libraries/k7test/logo",
    "email": null,
    "web": null,
    "street": null,
    "city": null,
    "zip": null,
    "latitude": null,
    "longitude": null,
    "collections": 280,
    "recommended_all": 0,
    "recommended_public": 0,
    "documents_all": 262369,
    "documents_public": 55023,
    "pages_all": 64199269,
    "pages_public": 8024740,
    "created_at": "2022-06-02T12:55:59.723Z",
    "updated_at": "2022-12-06T12:40:11.088Z",
    "last_document_at": "2022-12-01T01:43:24.221Z",
    "last_document_before": 5,
    "licenses": [{
      "id": "dnnto",
      "count": 33493232
    }, {
      "id": "dnntt",
      "count": 7670154
    }, {
      "id": "covid",
      "count": 31759
    }, {
      "id": "public",
      "count": 845
    }, {
      "id": "license",
      "count": 558
    }, {
      "id": "smlouva_ro",
      "count": 220
    }, {
      "id": "smlouva_pub",
      "count": 60
    }]
  },
  {
    "id": 3,
    "code": "svkhk",
    "sigla": "HKA001",
    "name": "Studijní a vědecká knihovna v Hradci Králové",
    "name_en": "Research Library in Hradec Králové",
    "alive": true,
    "last_state_switch": "2022-11-26T13:56:09.787Z",
    "state_duration": 859542,
    "version": "5.8.1",
    "url": "https://kramerius.svkhk.cz",
    "new_client_url": "https://kramerius.svkhk.cz",
    "new_client_version": "2.3.9",
    "logo": "https://api.registr.digitalniknihovna.cz/libraries/svkhk/logo",
    "email": "webmaster@svkhk.cz",
    "web": "http://www.svkhk.cz",
    "street": "Hradecká 1250/2",
    "city": "Hradec Králové",
    "zip": "500 03",
    "latitude": 50.2052,
    "longitude": 15.83149972,
    "collections": 36,
    "recommended_all": 22,
    "recommended_public": 13,
    "documents_all": 4934,
    "documents_public": 2799,
    "pages_all": 2021160,
    "pages_public": 913753,
    "created_at": "2016-10-23T13:50:30.160Z",
    "updated_at": "2022-11-26T21:00:41.415Z",
    "last_document_at": "2022-11-22T07:03:19.533Z",
    "last_document_before": 14,
    "licenses": [{
      "id": "dnnto",
      "count": 944050
    }, {
      "id": "dnntt",
      "count": 5622
    }]
  },

];
  /** end of mock data */

  cdkMock:any ={"svkhk":{"status":true},"kkp":{"status":true},"svkul":{"status":true},"knav":{"status":true},"uzei":{"status":true},"inovatika":{"status":true},"mzk":{"status":true}};


  displayedColumns: string[] = ['logo','code', 'name', 'state',  'stateDuration', 'showMapping','showSEChannel', 'switch'];

  dataSource:Library[];
  register:Map<String, any> = new Map();
  problems:Map<String, boolean> = new Map();

  constructor(
    private cdkApi: CdkApiService,
    public dialog: MatDialog
    ) { 
  }

  ngOnInit(): void {

    if (this.debug) {

      this.dataSource = Library.libsFromJson( this.cdkMock );
      let codes = this.dataSource.map(l=> l.code);
      this.registrMock.forEach(one=> {
        let code = one.code;
        if (codes.indexOf(code)> -1) {
          this.register.set(code, one);
        }
      });

    } else {

    this.cdkApi.connected().subscribe(resp=> {
      this.dataSource = resp;
      this.cdkApi.registrinfo().subscribe(resp=> {

        let codes = this.dataSource.map(l=> l.code);
        let registerResponse = resp;
        registerResponse.forEach(one=> {
          let code = one.code;
          if (codes.indexOf(code)> -1) {
            this.register.set(code, one);
          }
        });

        for (let code of this.register.keys()) {

          this.cdkApi.channel(code).subscribe(resp=> {
            if(resp.channel.solr && resp.channel.user) {
              let resp = this.register.get(code);
              if (resp) {
                this.problems.set(code,false);
              }
            } else {
              let resp = this.register.get(code);
              if (resp) {
                this.problems.set(code,true);
              }

            }
          });
 
        }
      });
    });
  }
  }

  public toggle(code:string, event: MatSlideToggleChange) {
    this.cdkApi.setStatus(code, event.checked).subscribe(resp=> {
      this.dataSource.forEach(l=> {
        if (l.code === code) {
          l.status = resp.status;
        }
      });
    });
  }

  logo(code) {
    if (this.register.get(code) != null && this.register.get(code)['logo']) {
      return this.register.get(code)['logo'];
    } else return null;
  }

  formatDuration(code) {
    if (this.register.get(code) != null && this.register.get(code)['state_duration']) {
      let duration = this.register.get(code)['state_duration'];
      let days = Math.floor(duration/(3600 * 24));
      let mods = duration % (3600 * 24)
      let hours = Math.floor(mods /  3600);
      mods = mods % 3600;
      let minutes = Math.floor(mods/60);
      if (days > 0) {
        return `${days}d  ${hours}h ${minutes}min`      
      } else if (hours > 0) {
        return `${hours}h ${minutes}min`      
      } else {
        return `${minutes}min`      
      }
    } 
  }

  up(lib) {
    let index = this.dataSource.indexOf(lib);
    if (index > 0) {
      this.arraymove(this.dataSource, index, index-1);
      console.log(this.dataSource);
    }
  }

  down(lib) {}

  arraymove(arr, fromIndex, toIndex) {
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
  }

  showMappingDialog(lib: any) {
    const dialogRef = this.dialog.open(ShowMappingDialogComponent, {
      data: {
        "code": lib.code,
        "register":this.register
      },
      panelClass: 'app-show-mapping-dialog',
      width: '800px'
    });
  }

  showSEChannelDialog(lib:any) {
    const dialogRef = this.dialog.open(ShowSeChannelDialogComponent, {
      data: {
        "code": lib.code,
        "register":this.register
      },
      panelClass: 'app-show-mapping-dialog',
      width: '800px'
    });

  }

}
