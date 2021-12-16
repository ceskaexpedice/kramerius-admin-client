import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Component({
  templateUrl: './object-access.component.html',
  styleUrls: ['./object-access.component.scss']
})
export class ObjectAccessComponent implements OnInit {

  view: string;
  pid: string;

  constructor(private local: LocalStorageService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.pid = params['pid'];
      this.view = this.local.getStringProperty('object_access.view', 'actions');
    });
  }

  changeView(view: string) {
    this.view = view;
    this.local.setStringProperty('object_access.view', view);
  }

}
