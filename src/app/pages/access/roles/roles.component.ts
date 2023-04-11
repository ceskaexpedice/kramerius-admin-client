import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateOrEditRoleDialogComponent } from 'src/app/dialogs/create-or-edit-role-dialog/create-or-edit-role-dialog.component';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { Role } from 'src/app/models/roles.model';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { UIService } from 'src/app/services/ui.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {

  state: string;
  roles: any[];

  errorMessage: string;
  errorState: boolean = false;
  

  constructor(private api: AdminApiService, 
    private ui: UIService,
    private dialog: MatDialog) {}

  ngOnInit() {
    this.state = 'loading';
    this.api.getRoles().subscribe((roles: Role[]) => {
      this.roles = roles;
      this.state = 'success';
      console.log('roles', roles);
    }, (error: HttpErrorResponse) => {
      this.errorState = true;
      this.errorMessage = error.error.message;
    });
  }

  onNewRole() {
    const dialogRef = this.dialog.open(CreateOrEditRoleDialogComponent, {
      width: '600px',
      panelClass: 'app-create-or-edit-right-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.role) {
        const role = result.role;
        this.roles.push(role);
        this.ui.showInfoSnackBar('snackbar.success.createOrEditRole');
        (error) => {
          if (error) {
            this.ui.showErrorSnackBar('snackbar.error.createOrEditRole');
          }
        }
      }
    });
  }

  onRemoveRole(role: Role) {
    const data: SimpleDialogData = {
      title: this.ui.getTranslation('modal.onRemoveRole.title'),
      message: this.ui.getTranslation('modal.onRemoveRole.message', {value: role.name}),
      btn1: {
        label: this.ui.getTranslation('button.remove'),
        value: 'yes',
        color: 'warn'
      },
      btn2: {
        label: this.ui.getTranslation('button.no'),
        value: 'no',
        color: ''
      }
    };
    const dialogRef = this.dialog.open(SimpleDialogComponent, { 
      data: data,
      width: '600px',
      panelClass: 'app-simple-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.api.removeRole(role).subscribe(() => {
          this.roles.splice(this.roles.indexOf(role), 1);
          this.ui.showInfoSnackBar('snackbar.success.onRemoveRole')
        },
        (error) => {
          if (error && error.error && error.error.status == 409) {
            this.ui.showInfoSnackBar('snackbar.error.onRemoveRole.409');
          } else {
            this.ui.showErrorSnackBar('snackbar.error.onRemoveRole.failed');
          }
        });
      }
    });
  }

  onEditRole(role: Role) {
    const dialogRef = this.dialog.open(CreateOrEditRoleDialogComponent, {
      data: { role: role },
      width: '600px',
      panelClass: 'app-create-or-edit-role-dialog'
    } );
    dialogRef.afterClosed().subscribe(result => {
        if (result && result.role) {
          this.ui.showInfoSnackBar('snackbar.success.onEditRole');
          role.copyFrom(result.role);
          (error) => {
            if (error) {
              this.ui.showErrorSnackBar('snackbar.error.onEditRole');
            }
          }
        }
    });
  }



}
