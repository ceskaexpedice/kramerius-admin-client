import { Component, OnInit } from '@angular/core';
import { ConditionParam } from 'src/app/models/condition-param.model';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { UIService } from 'src/app/services/ui.service';

@Component({
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
    (error) => {
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
