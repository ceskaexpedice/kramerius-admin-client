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
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { DeleteSelectedCollectionsDialogComponent } from 'src/app/dialogs/delete-selected-collections-dialog/delete-selected-collections-dialog.component';
import { UIService } from 'src/app/services/ui.service';
import { IsoConvertService } from 'src/app/services/isoconvert.service';
import { AppSettings } from 'src/app/services/app-settings';

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

  displayedColumns = ['select', 'name_cze', 'description_cze', 'createdAt', 'modifiedAt', 'action'];

  selection = new SelectionModel<any>(true, []);

  public langSelected: string = 'cs';
  // seznam vsech jazyku
  public langTranslated:string[] = ['cze', 'ces'];

  // all configured languages
  public languages = this.appSettings.languages;
  public lang: string = 'cs';


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
    private clientService: ClientApiService,
    private uiService: UIService,
    private isoConvert: IsoConvertService,
    private appSettings:AppSettings,
    private dialog: MatDialog) { }

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

      });
    } else {
      return null;
    }
  }

  displayLanguage() {
    let clang = this.uiService.currentLang;
    if (this.isoConvert.isTranslatable(clang)) {
      return this.isoConvert.convert(clang)[0];
    }
    return clang;
  }

  reload() {
    this.state = 'loading';

    this.clientService.getCollections(this.rows, this.page*this.rows, this.standaloneOnly, this.query, this.columnMapping[ this.sortField], this.sortAsc ? 'desc' : 'asc').subscribe((res)  => {
      this.allCollections = res["docs"].map((d)=> {
        let col:Collection = new Collection();
        // zjistit jazyk a pokud neni, search.title, collection.desc atd..         
        col.id= d.pid;
        col.standalone = d["collection.is_standalone"];
        
        col.names = {};
        
        for (const key in d) {
          if (key.startsWith("title.search_")) {
            // Extrahujeme klíč za podtržítkem
            const newKey = key.substring("title.search_".length);
            
            // Přidáme nový klíč a hodnotu do objektu titles
            col.names[newKey] = d[key];
          }
          if (key.startsWith("collection.desc_")) {
            // Extrahujeme klíč za podtržítkem
            const newKey = key.substring("collection.desc_".length);
            
            // Přidáme nový klíč a hodnotu do objektu titles
            col.descriptions[newKey] = d[key];
          }
        }
        let languages = this.appSettings.languages;
        languages.forEach(lang => {
          let converted:string[] = this.isoConvert.convert(lang);
          converted.forEach(conv => {
            if (!col.names[conv]) {
              col.names[conv] = d["title.search"] ;
            }
            if (!col.descriptions[conv] && d["collection.desc"] && d["collection.desc"][0]) {
              col.descriptions[conv] = d["collection.desc"][0];
            }
          });
        });

 
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

  setRouterLink(path: string = null, viewProperty: string = null, viewValue: string = null) {
    this.router.navigate([path]);
    this.locals.setStringProperty(viewProperty + '.view', viewValue);
  }

  getRouterLink(path: string = null, id: string,  viewProperty: string = null, viewValue: string = null) {
    this.locals.setStringProperty(viewProperty + '.view', viewValue);
    return path + id;
  }

  pageChanged(e: PageEvent) {
    this.page = e.pageIndex;
    this.rows = e.pageSize;
    this.reload();
  }

  reloadPage(routerLink) {
    //location.reload();
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
    this.router.navigate([routerLink]))
  }

  // Whether the number of selected elements matches the total number of rows
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  // Selects all rows if they are not all selected; otherwise clear selection.
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

  // The label for the checkbox on the passed row
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  deleteSelectedCollections() {
    let toDelete = [];
    this.collections.forEach(c=> {
      if (this.selection.isSelected(c)) {
        toDelete.push(c);
      }
    })

    const dialogRef = this.dialog.open(DeleteSelectedCollectionsDialogComponent, {
      data : { selection: toDelete },
      width: '600px',
      panelClass: 'app-delete-selected-collections-dialog'
    });
  }

  setLang(lang) {
    this.lang = lang;
    this.reload();
  }
}