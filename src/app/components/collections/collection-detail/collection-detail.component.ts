import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-collection-detail',
  templateUrl: './collection-detail.component.html',
  styleUrls: ['./collection-detail.component.scss']
})
export class CollectionDetailComponent implements OnInit {

  @Input() collection;
  @Input() state;

  constructor() { }

  ngOnInit() {
  }

}
