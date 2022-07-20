import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Role } from "src/app/models/roles.model";
import { AdminApiService } from "src/app/services/admin-api.service";

@Component({
  selector: 'app-create-or-edit-role-dialog',
  templateUrl: './create-or-edit-role-dialog.component.html',
  styleUrls: ['./create-or-edit-role-dialog.component.scss']
})
export class CreateOrEditRoleDialogComponent implements OnInit {

  role: Role;
  mode: string;
  errorMessage: string;

  constructor(public dialogRef: MatDialogRef<CreateOrEditRoleDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private api: AdminApiService) {
  }

  ngOnInit() {
    this.role = new Role();
    this.data = this.data || {};
    if (this.data.role) {
      this.mode = 'edit';
      this.role.copyFrom(this.data.role);
    } else {
      this.mode = 'new';
    }
  }

  onSave() {
    if (!this.role.name) {
      return;
    }
    if (this.mode == 'edit') {
      this.onUpdate();
    } else if (this.mode == 'new') {
      this.onCreate();
    }
  }


  private onCreate() {
    this.api.createRole(this.role).subscribe((role: Role) => {
      this.dialogRef.close({ role: role });
    },
    (error) => {
      if (error && error.error && error.error.status == 409) {
        this.errorMessage = "Role s tímto názvem už exituje, zadejte jiný název.";
      } else {
        this.errorMessage = "Roli se nepodařilo vytvořit.";
      }
    });
  }

  private onUpdate() {
    this.errorMessage = null;
    this.api.updateRole(this.role).subscribe((role: Role) => {
      this.dialogRef.close({ role: role });
    },
    (error) => {
      if (error && error.error && error.error.status == 409) {
        this.errorMessage = "Role s tímto názvem už exituje, zadejte jiný název.";
      } else {
        this.errorMessage = "Roli se nepodařilo upravit.";
      }
    });
  }

  onCancel() {
      this.cancel();
  }

  cancel() {
    this.dialogRef.close();
  }



}