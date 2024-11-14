import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { ConditionParam } from 'src/app/models/condition-param.model';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { UIService } from 'src/app/services/ui.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, MatIconModule,
    MatToolbarModule, MatButtonModule,  MatDialogModule, MatFormFieldModule, MatInputModule, MatTooltipModule],
  selector: 'app-add-new-parameter-dialog',
  templateUrl: './add-new-parameter-dialog.component.html',
  styleUrls: ['./add-new-parameter-dialog.component.scss']
})
export class AddNewParameterDialogComponent implements OnInit {

  public param: string;
  public value: string;
  public isParamCreated: boolean = false;
  public activeParam: ConditionParam;

  constructor(
    private api: AdminApiService,
    private ui: UIService
  ) { }

  public values: any = [];

  ngOnInit(): void {
  }

  createNewParam() {
    const value = this.param;
    if (value) {
      const tmp = new ConditionParam();
      tmp.description = value;
      this.api.createConditionParam(tmp).subscribe((cp: ConditionParam) => {
        this.activeParam = cp;
        this.activeParam.values = [];
        console.log('cp', cp);
      });
      this.isParamCreated = true;
    }
    this.ui.showInfoSnackBar('snackbar.success.onNewParam');
    (error: any) => {
      if (error) {
        this.ui.showErrorSnackBar('snackbar.error.onNewParam');
      }
    }
  }

  addNewParamValue() {
    const value = this.value;
    if (value) {
      this.activeParam.values.push(value);
      this.value = '';
      this.api.updateConditionParam(this.activeParam).subscribe((cp: ConditionParam) => {
        this.activeParam = cp;
        console.log('cp', cp);
      });
    }
  }
}
