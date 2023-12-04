import { Component, OnInit, Inject } from '@angular/core';
import { Data } from '@angular/router';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import { CdkApiService } from 'src/app/services/cdk-api.service';

@Component({
  selector: 'app-show-mapping-dialog',
  templateUrl: './show-mapping-dialog.component.html',
  styleUrls: ['./show-mapping-dialog.component.scss']
})
export class ShowMappingDialogComponent implements OnInit {


  table:any = {};

  constructor(@Inject(
    MAT_DIALOG_DATA) public data: any,     
    private cdkApi: CdkApiService
  ) { }

  ngOnInit(): void {
    this.cdkApi.mapping(this.data.code).subscribe(resp=> {
      let code = this.data.code;
      let name =   this.data.register.get(this.data.code).name;
      if (resp.length > 0) {
        this.table = {
          "code":code,
          "name": name,
          "items":resp

        };
      } else {
        this.table = {
          "code": code,
          "name": name,
          "items":[]
        };
       }
    }); 
  }
}
