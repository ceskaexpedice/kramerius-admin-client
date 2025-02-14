import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { Tree } from 'src/app/models/tree.model';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { ImportService } from 'src/app/services/import.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { UIService } from 'src/app/services/ui.service';
import { Router, RouterModule } from '@angular/router';
import { License } from 'src/app/models/license.model';
import { RunImportComponent } from 'src/app/dialogs/run-import/run-import.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { TreeComponent } from './tree/tree.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatTooltipModule, MatTabsModule, TreeComponent
  ],
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {

  type: string;
  tree: Tree;
  ndkPublic: boolean = false;
  ndkIIPServer: boolean;

  scheduleIndexations: boolean;
  inputDirError: any = {};

  selectedLicense:License;
  selectedCollection:string;
  licenses:License[];

  errorState: boolean = false;

  constructor(private api: AdminApiService,
    private dialog: MatDialog,
    private ui: UIService,
    public imports: ImportService,
    private local: LocalStorageService,
    private router: Router) { }

  ngOnInit() {
    this.ndkPublic = true;
    this.scheduleIndexations = true;
    this.ndkIIPServer = true;
    //this.type = this.local.getStringProperty('import.type', 'foxml');
    this.type = this.router.url.replace('/import/', '');
    this.initTree();

    this.api.getAllLicenses().subscribe((licenses: License[]) => {
      this.licenses = licenses;
    });

  }

  changeType(type: string) {
    this.type = type;
    this.local.setStringProperty('import.type', type);
    this.router.navigate(['/import/', type]);
    this.initTree();
  }

  initTree() {
    this.tree = new Tree(this.ui, this.type, { name: '/', isDir: true });
    this.imports.selectedTree = null;
    delete this.inputDirError[this.type];
    this.tree.expand(this.api, false, (error: any) => {
      this.inputDirError[this.type] = error;
      this.errorState = true;
      console.log(error);
    });
  }

  showHelpDialog() {
    let html = "";
    if (this.type == 'foxml') {
      html = this.ui.getTranslation('modal.showHelp.message.foxml');
    } else if (this.type == 'ndk') {
      html = this.ui.getTranslation('modal.showHelp.message.ndk');
    }
    const data: SimpleDialogData = {
      title: this.ui.getTranslation('modal.showHelp.title'),
      html: html,
      btn1: {
        label: 'OK',
        value: 'cancel',
        color: 'light'
      }
    };
    const dialogRef = this.dialog.open(SimpleDialogComponent, { 
      data: data,
      width: '600px',
      panelClass: 'app-simple'
    });
    
  }

  submit() {
    /*
    const data: SimpleDialogData = {

      title:   this.ui.getTranslation('modal.startImport.title'),
      message: this.selectedLicense ? this.ui.getTranslation('modal.startImport.licensemessage') : this.ui.getTranslation('modal.startImport.message'),
      btn1: {
        label: this.ui.getTranslation('button.schedule'),
        value: 'approve',
        color: 'primary'
      },
      btn2: {
        label: this.ui.getTranslation('button.cancel'),
        value: 'cancel',
        color: 'light'
      }
    };*/
    /* const dialogRef = this.dialog.open(SimpleDialogComponent, { 
      data: data,
      width: '600px',
      panelClass: 'app-simple'
    }); */


    const dialogRef = this.dialog.open(RunImportComponent, { 
      data: {
        type: this.type,
        licenses: this.licenses},
      width: '600px',
      panelClass: 'app-run-import-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {


      if (result) {
        this.selectedLicense = result.selectedLicense;
        this.selectedCollection = result.selectedCollection;
        this.scheduleIndexations = result.scheduleIndexation;
        this.ndkIIPServer = result.ndkIIPServer;
        if (this.type == 'foxml') {
          this.importFoxml();
        } else if (this.type == 'ndk') {
          this.importNdk();
        }
      }
    });
  }

  importNdk() {
    let p: any = {
      policy:  'PRIVATE',
      inputDataDir: this.imports.selectedTree.getFullPath(),
      startIndexer: this.scheduleIndexations,
      useIIPServer: this.ndkIIPServer,
    };

    if (this.selectedLicense) {
      p['license'] = this.selectedLicense.name;
    }
    if(this.selectedCollection) {
      p['collections'] = this.selectedCollection;
    }
    this.api.scheduleProcess({
      defid: 'convert_and_import',
      params: p
    }).subscribe(response => {
      this.ui.showInfoSnackBar('snackbar.success.scheduleImportProcess');
    }, error => {
      this.ui.showInfoSnackBar('snackbar.error.scheduleImportProcess');
      console.log(error);
    });
  }


  importFoxml() {
    this.api.scheduleProcess({
      defid: 'import',
      params: {
        inputDataDir: this.imports.selectedTree.getFullPath(),
        startIndexer: this.scheduleIndexations,
        license: this.selectedLicense?.name,
        collections: this.selectedCollection
      }
    }).subscribe(response => {
      this.ui.showInfoSnackBar('snackbar.success.scheduleImportProcess');
      // if (this.selectedLicense) {
      //   this.ui.showInfoSnackBar("scheduleApplyLicenseAndImportProcess");
      // } else {
      // }
    }, error => {
      this.ui.showInfoSnackBar('snackbar.error.scheduleImportProcess');
      console.log(error);
    });
  }

  clearPath() {
    this.imports.selectedTree = null;
  }
  
  getCurrentRoute(type: string) {
    if (type === 'string') {
      return this.router.url.replace('/import/', '');
    } else {
      return this.router.url;
    }
  } 
}
