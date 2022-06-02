import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Collection } from 'src/app/models/collection.model';
import { CollectionsService } from 'src/app/services/collections.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import {MatSort} from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss']
})

export class CollectionsComponent implements OnInit {

  collections: Collection[] = [];
  allCollections: Collection[] = [];
  // Paginator
  // resultCount = 0;
  // pageIndex = 0;
  // pageSize = 50;
  state = 'none';
  query: string;
  standaloneOnly: boolean;

  sortField: string;
  sortAsc: boolean;

  displayedColumns = ['name_cze', 'description_cze', 'createdAt', 'modifiedAt'];
  @ViewChild(MatSort) sort: MatSort;
  dataSource = new MatTableDataSource(this.collections);


  constructor(private collectionsService: CollectionsService, private router: Router, private locals: LocalStorageService) { }

  ngOnInit() {
    this.query = "";
    this.standaloneOnly = false;
    this.sortField = this.locals.getStringProperty('collectoins.sort_field', 'name_cze');
    this.sortAsc = this.locals.getBoolProperty('collectoins.sort_asc', false);
    this.reload();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  reload() {
    this.state = 'loading';
    // const offset = this.pageIndex * this.pageSize;
    // const limit = this.pageSize;
    this.collectionsService.getCollections(0, 5000).subscribe(([collections, count]: [Collection[], number]) => {
      this.allCollections = collections;
      // this.resultCount = count;
      this.reloadTable();
      this.state = 'success';
      this.dataSource = new MatTableDataSource(this.collections);
      this.dataSource.sort = this.sort;
    });
  }

  // onPageChanged(event: PageEvent) {
  //   this.pageIndex = event.pageIndex;
  //   this.reload();
  // }


  onNewCollections() {
    this.router.navigate(['/', 'collections', 'new']);
  }

  getSortIcon(field: string) {
    if (this.sortField === field) {
      if (this.sortAsc) {
        return 'arrow_drop_up';
      } else {
        return 'arrow_drop_down';
      }
    }
  }

  sortBy(field: string) {
    if (this.sortField === field) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortAsc = false;
    }
    this.sortField = field;
    this.locals.setStringProperty('products.sort_field', this.sortField);
    this.locals.setBoolProperty('products.sort_asc', this.sortAsc);
    this.reloadTable();
  }

  onSearch() {
    this.reloadTable();
  }

  onStandaloneChange() {
    this.reloadTable();
  }

  private reloadTable() {
    this.collections = [];
    console.log('this.standaloneOnly', this.standaloneOnly);
    for (const col of this.allCollections) {
      if (this.standaloneOnly && !col.standalone) {
        continue;
      }
      if (!this.query || col.name_cze.toLocaleLowerCase().indexOf(this.query.toLocaleLowerCase()) > -1) {
        this.collections.push(col);
      }
    }
    /* this.collections.sort((a: Collection, b: Collection) => {
      let r = 0;
      if (this.sortField == 'createdAt' || this.sortField == 'modifiedAt') {
        r = a[this.sortField].getTime() - b[this.sortField].getTime();
      } else {
        r = a[this.sortField].localeCompare(b[this.sortField]);
      }
      if (!this.sortAsc) {
        r = -r;
      }
      return r;
    }); */
    this.dataSource = new MatTableDataSource(this.collections);
    this.dataSource.sort = this.sort;
  }
}