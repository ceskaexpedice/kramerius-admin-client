import { Component, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Library } from 'src/app/models/cdk.library.model';
import { CdkApiService } from 'src/app/services/cdk-api.service';

/*
export interface ProxyElement {
  name: string;
  code: string;
  state: boolean;
  action: any;
}

const ELEMENT_DATA: ProxyElement[] = [
  {name: 'Hydrogen', code: 'AXC 4948330', state: false, action: ''},
  {name: 'Helium', code: 'AXC 4948330', state: false, action: ''},
  {name: 'Lithium', code: 'AXC 4948330', state: true, action: ''},
  {name: 'Beryllium', code: 'AXC 4948330', state: false, action: ''},
  {name: 'Boron', code: 'AXC 4948330', state: true, action: ''},
  {name: 'Carbon', code: 'AXC 4948330', state: true, action: ''},
  {name: 'Nitrogen', code: 'AXC 4948330', state: true, action: ''},
  {name: 'Oxygen', code: 'AXC 4948330', state: false, action: ''},
  {name: 'Fluorine', code: 'AXC 4948330', state: true, action: ''},
  {name: 'Neon', code: 'AXC 4948330', state: true, action: ''},
];
*/

@Component({
  selector: 'app-cdk-proxy',
  templateUrl: './cdk-proxy.component.html',
  styleUrls: ['./cdk-proxy.component.scss']
})
export class CdkProxyComponent implements OnInit {

  displayedColumns: string[] = ['logo','name', 'code', 'online',  'stateduration','state'];
  dataSource:Library[];
  register:Map<String, any> = new Map();
  //register:any;
  constructor(private cdkApi: CdkApiService) { 
  }

  ngOnInit(): void {
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
      });
    });
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
      if (days > 1) {
        return `${days}d  ${hours}h ${minutes}min`      
      } else if (hours > 1) {
        return `${hours}h ${minutes}min`      
      } else {
        return `${minutes}min`      
      }
    } 
  }
}
