import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { Tree } from 'src/app/models/tree.model';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { ImportService } from 'src/app/services/import.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { UIService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {

  type: string;
  tree: Tree;
  ndkPublic: boolean;
  scheduleIndexations: boolean;

  constructor(private api: AdminApiService, 
    private dialog: MatDialog,
    private ui: UIService,
    private imports: ImportService,
    private local: LocalStorageService) {}

  ngOnInit() {
    this.ndkPublic = true;
    this.scheduleIndexations = true;
    this.type = this.local.getStringProperty('import.type', 'foxml');
    this.initTree();
  }

  changeType(type: string) {
    this.type = type;
    this.local.setStringProperty('import.type', type);
    this.initTree();
  }

  initTree() {
    this.tree = new Tree(this.type, { name: '/', isDir: true });
    this.imports.selectedTree = null;
    this.tree.expand(this.api);
  }

  showHelpDialog() {
    let html = "";
    if (this.type == 'foxml') {
      html = "<p>Naplánujte proces, který importuje FOXML soubory ze zvoleného importního adresáře na serveru.</p><p>Kořenový adresář pro import FOXML je typicky <i>$HOME/.kramerius/import</i>.</p>";
    } else if (this.type == 'ndk') {
      html = "<p>Naplánujte proces, který konvertuje soubory ve formátu NDK METS ze zvoleného importního adresáře na serveru a výsledek importuje.</p><p>Kořenový adresář pro import NDK METS je typicky <i>$HOME/.kramerius/convert</i>.</p>";
    }
    const data: SimpleDialogData = {
      title: "Nápověda",
      html: html,
      btn1: {
        label: 'OK',
        value: 'cancel',
        color: 'light'
      }
    };
    const dialogRef = this.dialog.open(SimpleDialogComponent, { data: data });
  }


  submit() {
    if (this.type == 'foxml') {
      this.importFoxml();
    } else if (this.type == 'ndk') {
      this.importNdk();
    }
  }

  importNdk() {
    this.api.scheduleProcess({
      defid: 'convert_and_import',
      params: {
        policy: this.ndkPublic ? 'PUBLIC' : 'PRIVATE',
        inputDataDir: this.imports.selectedTree.getFullPath(),
        startIndexer: this.scheduleIndexations,
      }
    }).subscribe(response => {
      this.ui.showInfoSnackBar("Import byl naplánován")
    }, error => {
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
      this.ui.showInfoSnackBar("Import byl naplánován")
    }, error => {
      console.log(error);
    });
  }

}