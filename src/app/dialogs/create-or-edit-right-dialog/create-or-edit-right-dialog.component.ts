import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ConditionParam } from "src/app/models/condition-param.model";
import { License } from "src/app/models/license.model";
import { Condition, Right } from "src/app/models/right.model";
import { Role } from "src/app/models/roles.model";
import { AdminApiService } from "src/app/services/admin-api.service";
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { MatDialog } from '@angular/material/dialog';
import { UIService } from "src/app/services/ui.service";
import { AddNewParameterDialogComponent } from "../add-new-parameter-dialog/add-new-parameter-dialog.component";
import { CreateOrEditRoleDialogComponent } from "../create-or-edit-role-dialog/create-or-edit-role-dialog.component";

@Component({
  selector: 'app-create-or-edit-right-dialog',
  templateUrl: './create-or-edit-right-dialog.component.html',
  styleUrls: ['./create-or-edit-right-dialog.component.scss']
})
export class CreateOrEditRightDialogComponent implements OnInit {

  right: Right;
  mode: string;

  action: string;
  roles: Role[];

  conditions: Condition[];
  // changed by PS
  //licenses: License[];
  licenses: string[];
  params: ConditionParam[];

  

  constructor(public dialogRef: MatDialogRef<CreateOrEditRightDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private api: AdminApiService,
              private dialog: MatDialog,
              private ui: UIService) {
  }

  ngOnInit() {
    this.conditions = [];
    this.action = this.data.action;
    this.right = new Right();
    this.right.action = this.action;
    this.data = this.data || {};
    if (this.data.right) {
      this.mode = 'edit';
      this.right.copyFrom(this.data.right);
    } else {
      this.mode = 'new';
      this.right.pid = this.data.pid;
    }
    // TODO: Moved by PS 
    // this.api.getLicenses().subscribe((licenses: License[]) => {
    //   this.licenses = licenses;
    //   if (this.data.right.condition.license) {
    //     let license =  this.licenses.find((license) => {
    //       return license.name == this.data.right.condition.license.name; 
    //     });
    //     this.data.right.license = license;
    //   }
    // });

    this.api.getRoles().subscribe((roles: Role[]) => {
      this.roles = roles;
      if (this.data.right?.role) {
        let role =  this.roles.find((role) => {
          return role.name == this.data.right.role.name; 
        });
        if (role) {
          this.right.role = role;
        }
      }
    });

    // Changed by PS - moved to conditions
    // this.api.getConditionParams().subscribe((params: ConditionParam[]) => {
    //   this.params = params;
    // });

    this.api.getConditions().subscribe((conditions) => {
      for (const key in conditions) {
        const c = conditions[key];
        if (c.applicableActions && c.applicableActions.indexOf(this.action) >= 0) {
          const condition = new Condition();
          condition.setCode(key);
          condition.paramsNecessary = c.paramsNecessary;
          condition.isLabelAssignable = c.isLabelAssignable;
          condition.rootLevelCriterum = c.rootLevelCriterum;
          this.conditions.push(condition);
          if (this.right.condition && this.right.condition.code == condition.code) {
            this.right.condition.paramsNecessary = condition.paramsNecessary;
            this.right.condition.isLabelAssignable = condition.isLabelAssignable;
            this.right.condition.rootLevelCriterum = condition.rootLevelCriterum;
            // added by PS
            this.right.condition = condition;
          }
        }
      }
      // condition
      this.api.getConditionParams().subscribe((params: ConditionParam[]) => {
        this.params = params;
        if (this.data.right?.condition.params) {
          let params =  this.params.find((p) => {
            return p.id ==this.data.right.condition.params.id; 
          });
          if (params) {
            this.right.condition.params = params;
          }
        }
      });

      this.api.getAllLicenses().subscribe((licenses: License[]) => {
        this.licenses = licenses.map((lic) => lic.name );
        if (this.data.right?.condition.license) {
          let license =  this.licenses.find((license) => {
            let eq =  license == this.data.right.condition.license; 
            return eq;
          });
          this.right.condition.license = license;
        }
      });

  });


  }

  selectLicense(license: string) {
    this.right.condition.license = license === '-' ? license : null;
  }

  selectParam(param: ConditionParam) {
    this.right.condition.params = param;
  }

  selectCondition(condition: Condition) {
    this.right.condition = condition;
  }

  onSave() {
    // TODO: validation
    if (!this.right.role ||
      (this.right.condition && this.right.condition.paramsNecessary && !this.right.condition.params)) {
        return;
      }
    if (this.mode == 'edit') {
      this.onUpdate();
    } else if (this.mode == 'new') {
      this.onCreate();
    }
  }


  private onCreate() {
    this.api.createRight(this.right).subscribe((right: Right) => {
      this.dialogRef.close({ right: right });
    });
  }

  private onUpdate() {
    this.api.updateRight(this.right).subscribe((right: Right) => {
      this.dialogRef.close({ right: right });
    });
  }

  onCancel() {
      this.cancel();
  }

  cancel() {
    this.dialogRef.close();
  }

  openAddNewParamDialog() {
    const dialogRef = this.dialog.open(AddNewParameterDialogComponent, { 
      width: '600px',
      panelClass: 'app-add-new-parameter-dialog'
    });

    // update list of parameters after dialog is closed
    dialogRef.afterClosed().subscribe(result => {
      this.api.getConditionParams().subscribe((params: ConditionParam[]) => {
        this.params = params;
        if (this.data.right?.condition.params) {
          let params =  this.params.find((p) => {
            return p.id ==this.data.right.condition.params.id; 
          });
          if (params) {
            this.right.condition.params = params;
          }
        }
      });
    });
  }

  openAddNewRoleDialog() {
    const dialogRef = this.dialog.open(CreateOrEditRoleDialogComponent, {
      width: '600px',
      panelClass: 'app-create-or-edit-role-dialog'
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

}


