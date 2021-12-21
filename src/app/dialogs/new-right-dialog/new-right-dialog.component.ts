
import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ConditionParam } from "src/app/models/condition-param.model";
import { License } from "src/app/models/license.model";
import { Condition, Right } from "src/app/models/right.model";
import { Role } from "src/app/models/roles.model";
import { AdminApiService } from "src/app/services/admin-api.service";

@Component({
  templateUrl: './new-right-dialog.component.html',
  styleUrls: ['./new-right-dialog.component.scss']
})
export class NewRightDialogComponent implements OnInit {

  right: Right;
  mode: string;

  action: string;
  roles: Role[];

  conditions: Condition[];
  licenses: License[];
  params: ConditionParam[];

  constructor(public dialogRef: MatDialogRef<NewRightDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private api: AdminApiService) {
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
    this.api.getLicenses().subscribe((licenses: License[]) => {
      this.licenses = licenses;
    });
    this.api.getRoles().subscribe((roles: Role[]) => {
      this.roles = roles;
    });
    this.api.getConditionParams().subscribe((params: ConditionParam[]) => {
      this.params = params;
    });
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
          }
        }
      }
    });


  }

  selectLicense(license: License) {
    this.right.condition.license = license ? license.name : null;
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

}


