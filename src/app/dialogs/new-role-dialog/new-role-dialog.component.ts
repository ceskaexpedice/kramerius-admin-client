import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Role } from "src/app/models/roles.model";
import { Admin2ApiService } from "src/app/services/admin2-api.service";

@Component({
  templateUrl: './new-role-dialog.component.html',
  styleUrls: ['./new-role-dialog.component.scss']
})
export class NewRoleDialogComponent implements OnInit {

  role: Role;
  mode: string;

  constructor(public dialogRef: MatDialogRef<NewRoleDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private api: Admin2ApiService) {
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
    console.log('on create');
    this.api.createRole(this.role).subscribe((role: Role) => {
      console.log('oncreate response', role);
      this.dialogRef.close({ role: role });
    });
  }

  private onUpdate() {
    this.api.updateRole(this.role).subscribe((role: Role) => {
      console.log('oncreate response', role);
      this.dialogRef.close({ role: role });
    });
  }

  onCancel() {
      this.cancel();
  }

  cancel() {
    this.dialogRef.close();
  }



}