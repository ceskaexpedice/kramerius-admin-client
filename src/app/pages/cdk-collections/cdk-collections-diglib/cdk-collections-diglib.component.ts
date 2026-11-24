import { Component, OnInit, OnChanges, SimpleChanges, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Collection } from 'src/app/models/collection.model';
import { CollectionsService } from 'src/app/services/collections.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AuthService } from 'src/app/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime } from "rxjs/operators";
import { ClientApiService } from 'src/app/services/client-api.service';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { DeleteSelectedCollectionsDialogComponent } from 'src/app/dialogs/delete-selected-collections-dialog/delete-selected-collections-dialog.component';
import { UIService } from 'src/app/services/ui.service';
import { IsoConvertService } from 'src/app/services/isoconvert.service';
import { AppSettings } from 'src/app/services/app-settings';
import { CreateCollectionBackupDialogComponent } from 'src/app/dialogs/create-collection-backup-dialog/create-collection-backup-dialog.component';
import { RestoreFromCollectionBackupDialogComponent } from 'src/app/dialogs/restore-from-collection-backup-dialog/restore-from-collection-backup-dialog.component';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { CdkApiService } from 'src/app/services/cdk-api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';;
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AddRemoteCollectionToCdkDialogComponent } from 'src/app/dialogs/add-remote-collection-to-cdk-dialog/add-remote-collection-to-cdk-dialog.component';
import { AdoptRemoteCollectionDialogComponent } from 'src/app/dialogs/adopt-remote-collection-dialog/adopt-remote-collection-dialog.component';

@Component({
    imports: [CommonModule, RouterModule, TranslateModule, FormsModule,
        MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule,
        MatTooltipModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatPaginatorModule,
        MatTableModule, MatSortModule, MatMenuModule, MatDividerModule
    ],
    selector: 'app-cdk-collections-diglib',
    templateUrl: './cdk-collections-diglib.component.html',
    styleUrls: ['./cdk-collections-diglib.component.scss']
})
export class CdkCollectionsDiglibComponent implements OnInit, OnChanges {

  @Input() standaloneOnly: boolean;
  @Input() selectedLibraryCode = '';
  @Output() selectedLibraryCodeChange = new EventEmitter<string>();

  // Debouncing 
  private subject: Subject<string> = new Subject();

  cdkMode: boolean;
  view: string;

  collections: Collection[] = [];
  allCollections: Collection[] = [];
  
  collectionActions:Map<string,string[]> = new Map();

  state = 'none';
  @Input() query: string;
  //standaloneOnly: boolean;

  sortField: string;
  sortAsc: boolean;

  errorMessage: string;
  errorState: boolean = false;
  libraryLogos: Record<string, string> = {};
  librariesByCode: Record<string, any> = {};
  libraryUrls: Record<string, string> = {};
  libraryCodes: string[] = [];

  // paging   
  pageIndex: number = 0;
  rows: number = 50;
  page: number = 0;
  numFound: number = 1000;

  displayedColumns = ['select', 'name_cze', 'logo', 'code', 'description_cze', 'createdAt', 'modifiedAt', 'actions'];

  selection = new SelectionModel<any>(true, []);

  public langSelected: string = 'cs';
  // seznam vsech jazyku
  public langTranslated:string[] = ['cze', 'ces'];

  // all configured languages
  public languages: string[];
  public lang: string;//'cs';


  columnMapping: any = {
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
    private appSettings: AppSettings,
    private dialog: MatDialog,
    private ui: UIService,
    private adminApi: AdminApiService,
    private cdkApi: CdkApiService,

    ) { }

  ngOnInit() {
    this.cdkMode = this.appSettings.cdkMode;
    this.languages = this.appSettings.languages;
    this.lang =  this.appSettings.defaultLang;//'cs';
    this.standaloneOnly = false;
    this.sortField = this.locals.getStringProperty('collectoins.sort_field', 'createdAt');
    this.sortAsc = this.locals.getBoolProperty('collectoins.sort_asc', true);

    this.subject.pipe(
      debounceTime(400)
    ).subscribe(searchTextValue => {
      this.reload();
    });

    this.reload();
    this.cdkApi.connected().subscribe({
      next: libraries => {
        this.libraryCodes = [...new Set((libraries || []).map(library => library.code).filter(Boolean))].sort();
        libraries.forEach(library => this.cdkApi.config(library.code).subscribe({
          next: (config: any) => {
            const clientUrl = config?.client || config?.baseurl;
            if (clientUrl) {
              this.libraryUrls[library.code] = clientUrl;
            }
          },
          error: () => { }
        }));
      },
      error: () => this.libraryCodes = [...new Set(this.allCollections.flatMap(collection => collection.libraryCodes || []))].sort()
    });
    this.cdkApi.registrinfo().subscribe({
      next: (libraries: any[]) => {
        const registeredLibraries = Array.isArray(libraries) ? libraries : [];
        this.libraryLogos = Object.fromEntries(
          registeredLibraries.filter(library => library?.code && library?.logo).map(library => [library.code, library.logo])
        );
        this.librariesByCode = Object.fromEntries(
          registeredLibraries.filter(library => library?.code).map(library => [library.code, library])
        );
      },
      error: () => {
        this.libraryLogos = {};
        this.librariesByCode = {};
      }
    });
    this.view = this.locals.getStringProperty('cdk-collections.view');
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['query'] && !changes['query'].firstChange) {
      this.page = 0;
      this.subject.next(this.query || '');
    }
    if (changes['selectedLibraryCode'] && !changes['selectedLibraryCode'].firstChange) {
      this.page = 0;
      this.reload();
    }
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
    } 
  }

  displayLanguage() {
    if (this.isoConvert.isTranslatable(this.lang)) {
      return this.isoConvert.convert(this.lang)[0];
    }
    return this.lang;
  }


  reload() {
    this.state = 'loading';

    this.clientService.getCollections(this.rows, this.page*this.rows, this.standaloneOnly, this.query, this.columnMapping[ this.sortField], this.sortAsc ? 'desc' : 'asc', 'diglib', this.selectedLibraryCode)
    .subscribe((res: any)  => {
      this.allCollections = res["docs"].map((d: any)=> {
        let col:Collection = new Collection();
        // zjistit jazyk a pokud neni, search.title, collection.desc atd..         
        col.id= d.pid;
        col.libraryCodes = this.readLibraryCodes(d['cdk.collection']);
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
        languages.forEach((lang: string) => {
          let converted:string[] = this.isoConvert.convert(lang);
          converted.forEach(conv => {
            if (!col.names[conv]) {
              col.names[conv] = '-undefined-' ;
            }
            if (!col.descriptions[conv] && d["collection.desc"] && d["collection.desc"][0]) {
              col.descriptions[conv] = '-undefined-';
            }
          });
        });

 
        col.createdAt = d["created"]
        col.modifiedAt = d["modified"]
        return col;
      });
      this.libraryCodes = [...new Set([...this.libraryCodes, ...this.allCollections.flatMap(collection => collection.libraryCodes || [])])].sort();

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
          let actions = d[k].map((v: any)=> v.code);
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


  readLibraryCodes(value: any): string[] {
    const values = Array.isArray(value) ? value : (typeof value === 'string' ? value.replace(/^\[|\]$/g, '').split(',') : []);
    return values.map(code => String(code).trim()).filter(code => !!code);
  }

  libraryLogo(collection: Collection): string | null {
    const code = collection.libraryCodes?.[0];
    return code ? this.libraryLogos[code] || null : null;
  }

  libraryLabel(collection: Collection): string {
    return collection.libraryCodes?.join(', ') || 'CDK';
  }

  libraryName(code: string): string {
    const library = this.librariesByCode[code];
    const name = this.lang === 'en'
      ? (library?.name_en || library?.name)
      : (library?.name || library?.name_cs);
    return name || code;
  }

  sourceCollectionUrl(collection: Collection): string | null {
    const code = collection.libraryCodes?.find(libraryCode => !!this.libraryUrls[libraryCode]);
    const baseUrl = code ? this.libraryUrls[code] : null;
    if (!baseUrl || !collection.id) {
      return null;
    }
    const pid = collection.id.startsWith('cdk/') ? collection.id.substring(4) : collection.id;
    return `${baseUrl.replace(/\/+$/, '')}/uuid/${pid}`;
  }

  scheduleCollectionHarvest(collection: Collection) {
    const library = collection.libraryCodes?.[0];
    if (!library || !collection.id) {
      this.ui.showErrorSnackBar('snackbar.error.anErrorOccurredWhileSaving');
      return;
    }
    const pid = collection.id.replace(/^cdk\//, '');
    this.cdkApi.scheduleCdkHarvest(library, {
      filterQuery: `pid_paths.children:\"${pid}\"`,
      showConfigurationOnly: 'false'
    }).subscribe({
      next: () => this.ui.showInfoSnackBar('snackbar.success.startTheProcess'),
      error: error => {
        console.error(error);
        this.ui.showErrorSnackBar('snackbar.error.anErrorOccurredWhileSaving');
      }
    });
  }

  addRemoteCollectionToCdk(collection: Collection) {
    const dialogRef = this.dialog.open(AddRemoteCollectionToCdkDialogComponent, {
      data: { pid: collection.id, title: collection.getName(this.displayLanguage()) || collection.id },
      width: '520px',
      maxHeight: '80vh',
      panelClass: 'app-add-item-to-collection'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result?.added) return;
      this.ui.showInfoSnackBar('snackbar.success.addThisCollectionToAnotherCollection');
    });
  }

  addRemoteCollectionContentsToCdk(collection: Collection) {
    const dialogRef = this.dialog.open(AddRemoteCollectionToCdkDialogComponent, {
      data: {
        pid: collection.id,
        title: collection.getName(this.displayLanguage()) || collection.id,
        addContents: true
      },
      width: '520px',
      maxHeight: '80vh',
      panelClass: 'app-add-item-to-collection'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result?.addContents || !result.collection) return;
      if (result.failedCount > 0) {
        this.ui.showErrorSnackBar('snackbar.error.addRemoteCollectionContentsToCdk');
      } else if (result.total > 0) {
        this.ui.showInfoSnackBar('snackbar.success.addRemoteCollectionContentsToCdk');
      }
    });
  }

  adoptRemoteCollection(collection: Collection) {
    const sourceLibrary = collection.libraryCodes?.[0];
    if (!sourceLibrary || !collection.id) return;
    const title = collection.getName(this.displayLanguage())
      || Object.values(collection.names || {}).find((name: any) => typeof name === 'string' && name.trim())
      || collection.id;
    this.dialog.open(AdoptRemoteCollectionDialogComponent, {
      data: { title, library: this.libraryLabel(collection) },
      width: '520px',
      panelClass: 'app-add-item-to-collection'
    }).afterClosed().subscribe(newTitle => {
      if (!newTitle) return;
      this.cdkApi.adoptRemoteCollection(sourceLibrary, { sourcePid: collection.id, title: newTitle }).subscribe({
        next: () => this.ui.showInfoSnackBar('snackbar.success.startTheProcess'),
        error: error => {
          console.error(error);
          this.ui.showErrorSnackBar('snackbar.error.anErrorOccurredWhileSaving');
        }
      });
    });
  }

  allowBePartOfCollection(pid: string) {
    if (this.collectionActions.has(pid)) {
      if (this.collectionActions.get(pid).includes('a_able_tobe_part_of_collections')) {
        return true;
      }
    }
    return false;
  }


  allowEdit(pid: string) {
    // Collections imported from partner libraries are presented as read-only.
    return false;
  }

  allowRights(pid: string) {
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

  // getSortIcon(field: string) {
  //   if (this.sortField === field) {
  //     if (this.sortAsc) {
  //       return 'arrow_drop_up';
  //     } else {
  //       return 'arrow_drop_down';
  //     }
  //   }
  // }

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

  reloadPage(routerLink: string) {
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
    let toDelete: any[] = [];
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

  setLang(lang: string) {
    this.lang = lang;
    this.reload();
  }

  openCreateCollectionBackupDialog() {
    const dialogRef = this.dialog.open(CreateCollectionBackupDialogComponent, {
      width: '600px',
      panelClass: 'app-create-collection-backup-dialog'
    });

    // this.routerLink = routerLink;


    let toDelete:string[] = [];
    this.dataSource.data.forEach(itm => {
      if (this.selection.isSelected(itm)) {
        toDelete.push(itm.id);
      }
    });
    

    dialogRef.afterClosed().subscribe(result => {
      if (result?.routerLink) {
        this.adminApi.scheduleProcess({
          defid: 'backup-collections',
          params: {
            pidlist:toDelete.join(';'),
            backupname: result.backupname
    
          }
        }).subscribe(response => {

          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
          this.router.navigate([result.routerLink]))
          this.ui.showInfoSnackBar('snackbar.success.startTheProcess');
  
        }, error => {
          console.log(error);
        });
      }
   });
  }

  openRestoreFromCollectionBackupDialog() {
    const dialogRef = this.dialog.open(RestoreFromCollectionBackupDialogComponent, {
      width: '800px',
      panelClass: 'app-restore-from-collection-backup-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.routerLink) {
        this.adminApi.scheduleProcess({
          defid: 'restore-collections',
          params: {
            backupname: result.backupname
          }
        }).subscribe(response => {

          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
          this.router.navigate([result.routerLink]))
          this.ui.showInfoSnackBar('snackbar.success.startTheProcess');
  
        }, error => {
          console.log(error);
        });
      }
    });
    // this.routerLink = routerLink;

    // this.dialogRef.close(
    //   this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
    //   this.router.navigate([routerLink]))
    // );

    // this.ui.showInfoSnackBar('snackbar.success.startTheProcess');

  }
}
