import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateOrEditRightDialogComponent } from 'src/app/dialogs/create-or-edit-right-dialog/create-or-edit-right-dialog.component';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { RightAction } from 'src/app/models/right-action.model';
import { Right } from 'src/app/models/right.model';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { AuthService } from 'src/app/services/auth.service';
import { UIService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-rights',
  templateUrl: './rights.component.html',
  styleUrls: ['./rights.component.scss']
})
export class RightsComponent implements OnInit {
  //TODO: prejmenovat na ActionsComponent. Je to hlavně seznam (relevantních) akcí. Až sekundárně administrace práv nad konkrétními akcemi

  state: string;
  // roles: any[];
  actionMap: {[key: string]: RightAction};
  selectedAction: RightAction;

  actions: RightAction[];

  @Input() pid: string;

  constructor(private api: AdminApiService,
    private authApi: AuthService, 
    private ui: UIService,
    private dialog: MatDialog) {}

  ngOnInit() {
    this.state = 'loading';

    this.api.getActions(this.pid || 'uuid:1').subscribe((rAct: RightAction[]) => {
      this.actionMap = {};

      rAct.forEach(a=> {
        this.actionMap[a.code] = a;
      });
      this.actions = rAct;

      // call rights
      this.api.getRights(this.pid || 'uuid:1').subscribe((rights: Right[]) => {
        for (const right of rights) {
          if (this.actionMap[right.action]) {
            this.actionMap[right.action].addRight(right);
          }
        }
        // this.roles = roles;
        this.state = 'success';
        console.log('rights', rights);
      });
    });

  }

  onEditRight(right: Right) {
    const dialogRef = this.dialog.open(CreateOrEditRightDialogComponent, {
      data : { 
        action: this.selectedAction.code,
        right: right.clone()
      },
      width: '600px',
      panelClass: 'app-create-or-edit-right-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
        if (result && result.right) {
          right.copyFrom(result.right);
        }
    });
  }

  onRemoveRight(action: RightAction, right: Right) {
    const data: SimpleDialogData = {
      title: this.ui.getTranslation('modal.removeRight.title'),
      message: this.ui.getTranslation('modal.removeRight.message') + '?',
      btn1: {
        label: this.ui.getTranslation('button.remove'),
        value: 'yes',
        color: 'warn'
      },
      btn2: {
        label: this.ui.getTranslation('button.cancel'),
        value: 'no',
        color: 'light'
      }
    };
    const dialogRef = this.dialog.open(SimpleDialogComponent, { 
      data: data,
      width: '600px',
      panelClass: 'app-simple-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.api.removeRight(right).subscribe((response) => {
          action.rights.splice(action.rights.indexOf(right), 1);
          this.ui.showInfoSnackBar('snackbar.success.theRightHasBeenRemoved');
          console.log('response', response);
        });
      }
    });
  }

  onNewRight(action: RightAction) {
    const dialogRef = this.dialog.open(CreateOrEditRightDialogComponent, {
      data : { action: this.selectedAction.code, pid: this.pid || 'uuid:1' },
      width: '600px',
      panelClass: 'app-create-or-edit-right-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
        if (result && result.right) {
            action.addRight(result.right);
        }
    });
  }

  // onEditRole(role: Role) {
  //   const dialogRef = this.dialog.open(NewRoleDialogComponent, {
  //     data: { role: role }
  //   } );
  //   dialogRef.afterClosed().subscribe(result => {
  //       if (result && result.role) {
  //         role.copyFrom(result.role);
  //       }
  //   });
  // }



  /*

  private initActions() {
    this.actions = [];
    this.actionMap = {};
    if (this.pid) {
      this.addAction('read', 'Číst data z aplikace');
      this.addAction('reindex', 'Manipulovat s indexem');
      this.addAction('delete', 'Spustit proces delete');
      this.addAction('export', 'Spustit statický export');
      this.addAction('setprivate', 'Spustit proces setprivate');
      this.addAction('setpublic', 'Spustit proces setpublic');
      this.addAction('administrate', 'Administrovat');
    } else {
      this.addAction('read', 'Číst data z aplikace');
      this.addAction('import', 'Importovat data do K4');
      this.addAction('convert', 'Spustit proces convert');
      this.addAction('replicationrights', 'Spustit proces replicationrights');
      this.addAction('enumerator', 'Spustit proces enumerator');
      this.addAction('reindex', 'Manipulovat s indexem');
      this.addAction('replikator_periodicals', 'Spustit proces replicator_periodicals');
      this.addAction('replikator_monographs', 'Spustit proces replicator_monographs');
      this.addAction('replikator_k3', 'K3 replikace');
      this.addAction('delete', 'Spustit proces delete');
      this.addAction('export', 'Spustit statický export');
      this.addAction('setprivate', 'Spustit proces setprivate');
      this.addAction('setpublic', 'Spustit proces setpublic');
      this.addAction('administrate', 'Administrovat');
      this.addAction('editor', 'Spustit editor');
      this.addAction('manage_lr_process', 'Manipulovat s adm. procesy');
      this.addAction('export_k4_replications', 'Replikovat objekty z K4');
      this.addAction('import_k4_replications', 'Importovat replikované objekty z jiného K4');
      this.addAction('export_cdk_replications', 'Replikovat objekty z K4 do ČDK');
      this.addAction('edit_info_text', 'Editovat informace o digitální knihovně');
      this.addAction('rightsadmin', 'Spustit editor uživatelů v superadmin módu');
      this.addAction('rightssubadmin', 'Spustit editor uživatelů v subadmin módu');
      this.addAction('virtualcollection_manage', 'Administrace virtuálních sbírek');
      this.addAction('criteria_rights_manage', 'Spravovat dodatečné podmínky');
      this.addAction('ndk_mets_import', 'NDK Mets import');
      this.addAction('aggregate', 'Agregace procesů');
      this.addAction('sort', 'Třídit');
      this.addAction('show_alternative_info_text', 'Ukázat alternativní informativní text');
      this.addAction('display_admin_menu', 'Zobrazení administrativního menu');
      this.addAction('show_statictics', 'Zobrazit statistiky');
      this.addAction('show_print_menu', 'Tisknout');
      this.addAction('show_client_print_menu', 'Zobrazit print menu');
      this.addAction('show_client_pdf_menu', 'Show pdf menu');
      this.addAction('pdf_resource', 'Use pdf resource');
      this.addAction('dnnt_admin', 'Dnnt administrace');
    }
  }

  private addAction(code: string, description: string) {
    const action = new RightAction(code, description);
    this.actions.push(action);
    this.actionMap[code] = action;
  }
 */
}
