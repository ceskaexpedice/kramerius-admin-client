import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-info-dialog',
  templateUrl: './user-info-dialog.component.html',
  styleUrls: ['./user-info-dialog.component.scss']
})
export class UserInfoDialogComponent implements OnInit {

  public userInfo: any = [{
      "uid": "uid_inovatika@lib.cas.cz",
      "authenticated": true,
      "licenses": [
          "dnntt",
          "test"
      ],
      "session": {
          "token_id": "c5178cb2-d50f-4231-a2cf-6337a694a999",
          "affiliation": "[member@lib.cas.cz]",
          "expiration_time": "1693843871",
          "eduPersonPrincipalName": "inovatika@lib.cas.cz",
          "eduPersonUniqueId": "uid_inovatika@lib.cas.cz",
          "expires_in": "21600",
          "preffered_user_name": "inovatika@lib.cas.cz",
          "email": "pavel.stastny@inovatika.cz",
          "nezbeda": "inovatika@lib.cas.cz",
          "authentication_time": "1693822271"
      },
      "roles": [
          "common_users",
          "default-roles-kramerius",
          "dnnt_users",
          "kramerius_admin",
          "offline_access",
          "uma_authorization"
      ],
      "name": "Pavel Stastny"
  }]

  constructor() { }

  ngOnInit(): void {
  }

  

}
