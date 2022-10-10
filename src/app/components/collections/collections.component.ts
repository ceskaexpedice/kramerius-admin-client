import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Collection } from 'src/app/models/collection.model';
import { CollectionsService } from 'src/app/services/collections.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import {MatSort} from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AuthService } from 'src/app/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss']
})

export class CollectionsComponent implements OnInit {

  collections: Collection[] = [];
  allCollections: Collection[] = [];
  
  collectionActions:Map<string,string[]> = new Map();

  state = 'none';
  query: string;
  standaloneOnly: boolean;

  sortField: string;
  sortAsc: boolean;

  errorMessage: string;
  errorState: boolean = false;

  // paging   
  pageIndex: number = 0;
  rows: number = 50;
  page: number = 0;
  numFound: number = 1000;

  displayedColumns = ['name_cze', 'description_cze', 'createdAt', 'modifiedAt', 'action'];
  @ViewChild(MatSort) sort: MatSort;
  dataSource = new MatTableDataSource(this.collections);


  constructor(
    private auth:AuthService,
    private collectionsService: CollectionsService, 
    private router: Router, private locals: LocalStorageService) { }

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
    this.collectionsService.getCollections(this.page, this.rows).subscribe(([collections, count]: [Collection[], number]) => {
    
      this.numFound = count;
      this.allCollections = collections;



      this.reloadTable();
      this.state = 'success';
      this.dataSource = new MatTableDataSource(this.collections);
      this.dataSource.sort = this.sort;

      // defaultne je vse povoleno
      this.allCollections.forEach((c)=>{
        this.collectionActions.set(c.id, ['a_collections_edit', 'a_rights_edit']);
      });
      

      this.auth.getPidsAuthorizedActions(this.allCollections.map((c)=> c.id), ['a_collections_edit', 'a_rights_edit']).subscribe((d:any) => {
        Object.keys(d).forEach((k)=> {
          let actions = d[k].map((v)=> v.code);
          this.collectionActions.set(k, actions);
        });
      });

    }, (error: HttpErrorResponse) => {
      this.errorState = true;
      this.errorMessage = error.error.message;
    });
  }


  allowBePartOfCollection(pid) {
    if (this.collectionActions.has(pid)) {
      if (this.collectionActions.get(pid).includes('a_able_tobe_part_of_collections')) {
        return true;
      }
    }
    return false;
  }


  allowEdit(pid) {
    if (this.collectionActions.has(pid)) {
      if (this.collectionActions.get(pid).includes('a_collections_edit')) {
        return true;
      }
    }
    return false;
  }

  allowRights(pid) {
    if (this.collectionActions.has(pid)) {
      if (this.collectionActions.get(pid).includes('a_rights_edit')) {
        return true;
      }
    }
    return false;
  }

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

  allowedGlobalAction(name:string) {
    if (this.auth.authorizedGlobalActions) {
      let retval = this.auth.authorizedGlobalActions.indexOf(name) >= 0;
      return retval;
    } else return false;
  }


  private reloadTable() {
    this.collections = [];
    //console.log('this.standaloneOnly', this.standaloneOnly);
    for (const col of this.allCollections) {
      if (this.standaloneOnly && !col.standalone) {
        continue;
      }
      if (!this.query || col.name_cze.toLocaleLowerCase().indexOf(this.query.toLocaleLowerCase()) > -1) {
        this.collections.push(col);
      }
    }
    this.dataSource = new MatTableDataSource(this.collections);
    this.dataSource.sort = this.sort;
  }

  setRouterLink(path: string = null, id: string,  viewProperty: string = null, viewValue: string = null) {
    this.router.navigate([path, id]);
    this.locals.setStringProperty(viewProperty + '.view', viewValue);
  }

  pageChanged(e: PageEvent) {
    this.page = e.pageIndex;
    this.rows = e.pageSize;
    this.reloadTable();
  }

}