import { Component, OnInit } from '@angular/core';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { ClientApiService } from 'src/app/services/client-api.service';

@Component({
  selector: 'app-rights',
  templateUrl: './rights.component.html',
  styleUrls: ['./rights.component.scss']
})
export class RightsComponent implements OnInit {

  constructor(private api: AdminApiService) {}

  ngOnInit() {
    this.api.getRights().subscribe((response) => {
      console.log('response', response);
    });
  }

}
