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
  params: ConditionParam[];

  constructor(
    private api: AdminApiService,
    private ui: UIService
  ) { }

  public values:any = [];

  ngOnInit(): void {
  }

  createNewParam() {
    const value = this.param;
    if (value) {
      const param = new ConditionParam();
      param.description = value;
      this.api.createConditionParam(param).subscribe((cp: ConditionParam) => {
        this.params.push(cp);
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

  addNewParamValue(param?: ConditionParam) {
    const value = this.value;
    if (value) {
      param.values.push(value);
      this.api.updateConditionParam(param).subscribe((cp: ConditionParam) => {
        console.log('cp', cp);
        console.log('test');
      });
    }
  }
}
