import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Collection } from 'src/app/models/collection.model';
import { CollectionsService } from 'src/app/services/collections.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import {MatSort, Sort} from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AuthService } from 'src/app/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { PageEvent } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime } from "rxjs/operators";
import { ClientApiService } from 'src/app/services/client-api.service';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss']
})

export class CollectionsComponent implements OnInit {

  // Debouncing 
  private subject: Subject<string> = new Subject();


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
  columnMapping = {
    'name_cze':'title.sort',
    'createdAt':'created',
    'modifiedAt':"modified"
  };

  @ViewChild(MatSort) sort: MatSort;
  dataSource = new MatTableDataSource(this.collections);


  constructor(
    private auth:AuthService,
    private collectionsService: CollectionsService, 
    private router: Router, private locals: LocalStorageService,
    private clientService: ClientApiService) { }

  ngOnInit() {
    this.query = "";
    this.standaloneOnly = false;
    this.sortField = this.locals.getStringProperty('collectoins.sort_field', 'createdAt');
    this.sortAsc = this.locals.getBoolProperty('collectoins.sort_asc', true);

    this.subject.pipe(
      debounceTime(400)
    ).subscribe(searchTextValue => {
      this.reload();
    });

    this.reload();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  linkToDetail(id:string) {
    if (this.allowEdit(id)) {
      // load full collection
      this.collectionsService.getCollection(id).subscribe((collection: Collection) => {

        let aIndex = this.allCollections.findIndex(c => c.id ===id);
        if (aIndex>=0) this.allCollections[aIndex] = collection;

        let cIndex = this.collections.findIndex(c => c.id ===id);
        if (cIndex >=0 ) this.collections[cIndex] = collection;

        this.setRouterLink('/collections/detail/', id, 'collection', 'detail')
      });
    } else {
      return null;
    }
  }

  reload() {
    this.state = 'loading';

    this.clientService.getCollections(this.rows, this.page*this.rows, this.standaloneOnly, this.query, this.columnMapping[ this.sortField], this.sortAsc ? 'desc' : 'asc').subscribe((res)  => {
      this.allCollections = res["docs"].map((d)=> {
        let col:Collection = new Collection();
        
        col.id= d.pid;
        col.standalone = d["collection.is_standalone"];
        col.name_cze = d["title.search"];
        if (d["collection.desc"] && d["collection.desc"][0]) {
          col.description_cze = d["collection.desc"][0];
        }
        col.createdAt = d["created"]
        col.modifiedAt = d["modified"]
        return col;
      });

      this.numFound = res["numFound"];

      this.reloadTable();
      //this.state = 'success';
      this.dataSource = new MatTableDataSource(this.collections);
      //this.dataSource.sort = this.sort;

      // defaultne je vse povoleno
      this.allCollections.forEach((c)=>{
        this.collectionActions.set(c.id, ['a_collections_edit', 'a_rights_edit']);
      });
      

      this.auth.getPidsAuthorizedActions(this.allCollections.map((c)=> c.id), ['a_collections_edit', 'a_rights_edit']).subscribe((d:any) => {
        Object.keys(d).forEach((k)=> {
          let actions = d[k].map((v)=> v.code);
          this.collectionActions.set(k, actions);
        });
        this.state = 'success';
      });

    });    
  

    /*
    this.collectionsService.getCollectionsByPrefix(this.page, this.rows, this.query).subscribe(([collections, count]: [Collection[], number]) => {
      this.numFound = count;
      this.allCollections = collections;

      this.reloadTable();
      //this.state = 'success';
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
        this.state = 'success';
      });

    }, (error: HttpErrorResponse) => {
      this.errorState = true;
      this.errorMessage = error.error.message;
    });
    */

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

  // TODO: Not used
  sortBy(field: string) {
    if (this.sortField === field) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortAsc = false;
    }
    this.sortField = field;
    this.locals.setStringProperty('products.sort_field', this.sortField);
    this.locals.setBoolProperty('products.sort_asc', this.sortAsc);
    this.reload();
    //this.reloadTable();
  }

  changeSort(sortState: Sort) {
    if (sortState.direction) {
      this.sortField = sortState.active;
      this.sortAsc = sortState.direction === 'asc';
      console.log(sortState.active);
      console.log(sortState.direction);
      //this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this.standaloneOnly = false;
      this.sortField = this.locals.getStringProperty('collectoins.sort_field', 'name_cze');
      this.sortAsc = this.locals.getBoolProperty('collectoins.sort_asc', false);
      //this._liveAnnouncer.announce('Sorting cleared');
    }
    this.reload();
  }

  
  onSearch() {
    this.subject.next(this.query);  
    //this.reloadTable();
  }

  onStandaloneChange() {
    this.subject.next(this.query);  
    //this.reloadTable();
  }

  allowedGlobalAction(name:string) {
    if (this.auth.authorizedGlobalActions) {
      let retval = this.auth.authorizedGlobalActions.indexOf(name) >= 0;
      return retval;
    } else return false;
  }


  private reloadTable() {
    this.collections = [];
    for (const col of this.allCollections) {
      this.collections.push(col);
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
    this.reload();
  }

  reloadPage() {
    location.reload();
  }

}