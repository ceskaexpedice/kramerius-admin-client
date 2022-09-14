import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { ConditionParam } from 'src/app/models/condition-param.model';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { UIService } from 'src/app/services/ui.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-params',
  templateUrl: './params.component.html',
  styleUrls: ['./params.component.scss']
})
export class ParamsComponent implements OnInit {

  state: string;
  params: ConditionParam[];

  selectedParam: ConditionParam;
  errorMessage: string;

  constructor(private api: AdminApiService, 
    private ui: UIService,
    private dialog: MatDialog) {}

  ngOnInit() {
    this.state = 'loading';
    this.api.getConditionParams().subscribe((params: ConditionParam[]) => {
      this.params = params;
      this.state = 'success';
      console.log('params', params);
    }, (error: HttpErrorResponse) => {
      this.state = 'error';
      this.errorMessage = error.error.message;
    }
    );
  }

  onNewParam() {
    const data: SimpleDialogData = {
      title: this.ui.getTranslation('modal.onNewParam.title'),
      message: "",
      textInput: {
        label: this.ui.getTranslation('desc.name'),
        value: ""
      },
      btn1: {
        label: this.ui.getTranslation('button.create'),
        value: 'create',
        color: 'primary'
      },
      btn2: {
        label: this.ui.getTranslation('button.cancel'),
        value: 'cancel',
        color: 'light'
      }
    };
    const dialogRef = this.dialog.open(SimpleDialogComponent, { 
      data: data,
      width: '600px',
      panelClass: 'app-simple-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'create') {
        const value = data.textInput.value;
        if (value) {
          const param = new ConditionParam();
          param.description = value;
          this.api.createConditionParam(param).subscribe((cp: ConditionParam) => {
            this.params.push(cp);
            console.log('cp', cp);
          });
        }
        this.ui.showInfoSnackBar('snackbar.success.onNewParam');
        (error) => {
          if (error) {
            this.ui.showErrorSnackBar('snackbar.error.onNewParam');
          }
        }
      }
    });
  }

  onNewValue(param: ConditionParam) {
    const data: SimpleDialogData = {
      title: this.ui.getTranslation('modal.onNewValue.title'),
      message: "",
      textInput: {
        label: this.ui.getTranslation('desc.value'),
        value: ""
      },
      btn1: {
        label: this.ui.getTranslation('button.add'),
        value: 'create',
        color: 'primary'
      },
      btn2: {
        label: this.ui.getTranslation('button.cancel'),
        value: 'cancel',
        color: 'light'
      }
    };
    const dialogRef = this.dialog.open(SimpleDialogComponent, { 
      data: data,
      width: '600px',
      panelClass: 'app-simple-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'create') {
        const value = data.textInput.value;
        if (value) {
          param.values.push(value);
          this.api.updateConditionParam(param).subscribe((cp: ConditionParam) => {
            console.log('cp', cp);
          });
        }
        this.ui.showInfoSnackBar('snackbar.success.onNewValue');
        (error) => {
          if (error) {
            this.ui.showErrorSnackBar('snackbar.error.onNewValue');
          }
        }
      }
    });
  }

  onRemoveValue(param: ConditionParam, index: number) {
    const data: SimpleDialogData = {
      title: this.ui.getTranslation('modal.onRemoveValue.title'),
      message: this.ui.getTranslation('modal.onRemoveValue.message', {value: param.values[index]}),
      btn1: {
        label: this.ui.getTranslation('button.remove'),
        value: 'remove',
        color: 'warn'
      },
      btn2: {
        label: this.ui.getTranslation('button.cancel'),
        value: 'cancel',
        color: 'light'
      }
    };
    const dialogRef = this.dialog.open(SimpleDialogComponent, { 
      data: data,
      width: '600px',
      panelClass: 'app-simple-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'remove') {
        param.values.splice(index, 1);
        this.api.updateConditionParam(param).subscribe((cp: ConditionParam) => {
          console.log('cp', cp);
        });
        this.ui.showInfoSnackBar('snackbar.success.onRemoveValue');
        (error) => {
          if (error) {
            this.ui.showErrorSnackBar('snackbar.error.onRemoveValue');
          }
        }
      }
    });
  }

  onEditValue(param: ConditionParam, index: number) {
    const data: SimpleDialogData = {
      title: this.ui.getTranslation('modal.onEditValue.title'),
      message: "",
      textInput: {
        label: this.ui.getTranslation('desc.value'),
        value: param.values[index] + ''
      },
      btn1: {
        label: this.ui.getTranslation('button.edit'),
        value: 'edit',
        color: 'primary'
      },
      btn2: {
        label: this.ui.getTranslation('button.cancel'),
        value: 'cancel',
        color: 'light'
      }
    };
    const dialogRef = this.dialog.open(SimpleDialogComponent, {
      data: data,
      width: '600px',
      panelClass: 'app-simple-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'edit' && data.textInput.value) {
        param.values[index] = data.textInput.value;
        this.api.updateConditionParam(param).subscribe((cp: ConditionParam) => {
          console.log('cp', cp);
        });
        this.ui.showInfoSnackBar('snackbar.success.onEditValue');
        (error) => {
          if (error) {
            this.ui.showErrorSnackBar('snackbar.error.onEditValue');
          }
        }
      }
    });
  }

  onRemoveParam(param: ConditionParam) {
    const data: SimpleDialogData = {
      title: this.ui.getTranslation('modal.onRemoveParam.title'),
      message: this.ui.getTranslation('modal.onRemoveParam.message', {value: param.description}),
      btn1: {
        label: this.ui.getTranslation('button.remove'),
        value: 'yes',
        color: 'warn'
      },
      btn2: {
        label: this.ui.getTranslation('button.no'),
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
        this.api.removeConditionParam(param).subscribe(() => {
          this.params.splice(this.params.indexOf(param), 1);
          this.ui.showInfoSnackBar('snackbar.success.onRemoveParam')
        },
        (error) => {
          this.ui.showInfoSnackBar('snackbar.error.onRemoveParam');
        });
      }
    });
  }

  onEditParam(param: ConditionParam) {
    const data: SimpleDialogData = {
      title: this.ui.getTranslation('modal.onEditParam.title'),
      message: "",
      textInput: {
        label: this.ui.getTranslation('desc.name'),
        value: param.description + ''
      },
      btn1: {
        label: this.ui.getTranslation('button.edit'),
        value: 'edit',
        color: 'primary'
      },
      btn2: {
        label: this.ui.getTranslation('button.cancel'),
        value: 'cancel',
        color: 'light'
      }
    };
    const dialogRef = this.dialog.open(SimpleDialogComponent, {
      data: data,
      width: '600px',
      panelClass: 'app-simple-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'edit' && data.textInput.value) {
        param.description = data.textInput.value;
        this.api.updateConditionParam(param).subscribe((cp: ConditionParam) => {
          console.log('cp', cp);
        });
        this.ui.showInfoSnackBar('snackbar.success.onEditParam');
        (error) => {
          if (error) {
            this.ui.showErrorSnackBar('snackbar.error.onEditParam');
          }
        }
      }
    });
  }



}
