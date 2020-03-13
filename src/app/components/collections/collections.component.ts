import { Component, OnInit } from '@angular/core';
import { Collection } from 'src/app/models/collection.model';
import { ApiService } from 'src/app/services/api.service';
import { PageEvent } from '@angular/material';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss']
})
export class CollectionsComponent implements OnInit {

  collections: Collection[];

    // Paginator
    resultCount = 0;
    pageIndex = 0;
    pageSize = 50;
    state = 'none';

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.state = 'loading';
    const offset = this.pageIndex * this.pageSize;
    const limit = this.pageSize;
    this.api.getCollections(offset, limit).subscribe(([collections, count]: [Collection[], number]) => {
      this.collections = collections;
      this.resultCount = count;
      this.state = 'success';
    });
  }

  onPageChanged(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.reload();
  }

}