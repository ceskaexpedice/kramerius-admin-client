import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateOrEditRoleDialogComponent } from 'src/app/dialogs/create-or-edit-role-dialog/create-or-edit-role-dialog.component';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { Role } from 'src/app/models/roles.model';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { UIService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {

  state: string;
  roles: any[];

  constructor(private api: AdminApiService, 
    private ui: UIService,
    private dialog: MatDialog) {}

  ngOnInit() {
    this.state = 'loading';
    this.api.getRoles().subscribe((roles: Role[]) => {
      this.roles = roles;
      this.state = 'success';
      console.log('roles', roles);
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
        }
    });
  }

  onRemoveRole(role: Role) {
    const data: SimpleDialogData = {
      title: "Odstranění role",
      message: `Opravdu chcete odstranit roli ${role.name}?`,
      btn1: {
        label: 'Odstranit',
        value: 'yes',
        color: 'warn'
      },
      btn2: {
        label: 'Ne',
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
          this.ui.showInfoSnackBar("Role byla odstraněna")
        },
        (error) => {
          if (error && error.error && error.error.status == 409) {
            this.ui.showInfoSnackBar("Role je použita, není možné ji odstranit");
          } else {
            this.ui.showInfoSnackBar("Roli se nepodřilo odstranit");
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
          this.ui.showInfoSnackBar("Role byla upravena.")
          role.copyFrom(result.role);
        }
    });
  }



}
