import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { Tree } from 'src/app/models/tree.model';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { ImportService } from 'src/app/services/import.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { UIService } from 'src/app/services/ui.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {

  type: string;
  tree: Tree;
  ndkPublic: boolean;
  ndkIIPServer: boolean;

  scheduleIndexations: boolean;
  inputDirError = {};

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
    this.tree.expand(this.api, false, error => {
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
    const data: SimpleDialogData = {
      title: this.ui.getTranslation('modal.startImport.title'),
      message: this.ui.getTranslation('modal.startImport.message'),
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
    };
    const dialogRef = this.dialog.open(SimpleDialogComponent, { 
      data: data,
      width: '600px',
      panelClass: 'app-simple'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'approve') {
        if (this.type == 'foxml') {
          this.importFoxml();
        } else if (this.type == 'ndk') {
          this.importNdk();
        }
      }
    });
  }

  importNdk() {
    this.api.scheduleProcess({
      defid: 'convert_and_import',
      params: {
        policy: this.ndkPublic ? 'PUBLIC' : 'PRIVATE',
        inputDataDir: this.imports.selectedTree.getFullPath(),
        startIndexer: this.scheduleIndexations,
        useIIPServer: this.ndkIIPServer        
      }
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
      }
    }).subscribe(response => {
      this.ui.showInfoSnackBar('snackbar.success.scheduleImportProcess');
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
