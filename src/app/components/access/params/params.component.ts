import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { ConditionParam } from 'src/app/models/condition-param.model';
import { Admin2ApiService } from 'src/app/services/admin2-api.service';
import { UIService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-params',
  templateUrl: './params.component.html',
  styleUrls: ['./params.component.scss']
})
export class ParamsComponent implements OnInit {

  state: string;
  params: ConditionParam[];

  selectedParam: ConditionParam;


  constructor(private api: Admin2ApiService, 
    private ui: UIService,
    private dialog: MatDialog) {}

  ngOnInit() {
    this.state = 'loading';
    this.api.getConditionParams().subscribe((params: ConditionParam[]) => {
      this.params = params;
      this.state = 'success';
      console.log('params', params);
    });
  }

  onNewParam() {
    const data: SimpleDialogData = {
      title: "Nový parametr",
      message: "",
      textInput: {
        label: "Název",
        value: ""
      },
      btn1: {
        label: 'Vytvořit',
        value: 'create',
        color: 'primary'
      },
      btn2: {
        label: 'Zrušit',
        value: 'cancel',
        color: 'light'
      }
    };
    const dialogRef = this.dialog.open(SimpleDialogComponent, { data: data });
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
      }
    });
  }

  onNewValue(param: ConditionParam) {
    const data: SimpleDialogData = {
      title: "Nová hodnota parametru",
      message: "",
      textInput: {
        label: "Hodnota",
        value: ""
      },
      btn1: {
        label: 'Přidat',
        value: 'create',
        color: 'primary'
      },
      btn2: {
        label: 'Zrušit',
        value: 'cancel',
        color: 'light'
      }
    };
    const dialogRef = this.dialog.open(SimpleDialogComponent, { data: data });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'create') {
        const value = data.textInput.value;
        if (value) {
          param.values.push(value);
          this.api.updateConditionParam(param).subscribe((cp: ConditionParam) => {
            console.log('cp', cp);
          });
        }
      }
    });
  }

  onRemoveValue(param: ConditionParam, index: number) {
    const data: SimpleDialogData = {
      title: "Nová hodnota parametru",
      message: `Opravdu chcete odebrat hodnotu ${param.values[index]}`,
      btn1: {
        label: 'Odebrat',
        value: 'remove',
        color: 'warn'
      },
      btn2: {
        label: 'Zrušit',
        value: 'cancel',
        color: 'light'
      }
    };
    const dialogRef = this.dialog.open(SimpleDialogComponent, { data: data });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'remove') {
        param.values.splice(index, 1);
        this.api.updateConditionParam(param).subscribe((cp: ConditionParam) => {
          console.log('cp', cp);
        });
      }
    });
  }

  onEditValue(param: ConditionParam, index: number) {
    const data: SimpleDialogData = {
      title: "Úprava hodnoty parametru",
      message: "",
      textInput: {
        label: "Hodnota",
        value: param.values[index] + ''
      },
      btn1: {
        label: 'Upravit',
        value: 'edit',
        color: 'primary'
      },
      btn2: {
        label: 'Zrušit',
        value: 'cancel',
        color: 'light'
      }
    };
    const dialogRef = this.dialog.open(SimpleDialogComponent, { data: data });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'edit' && data.textInput.value) {
        param.values[index] = data.textInput.value;
        this.api.updateConditionParam(param).subscribe((cp: ConditionParam) => {
          console.log('cp', cp);
        });
      }
    });
  }

  onRemoveParam(param: ConditionParam) {
    const data: SimpleDialogData = {
      title: "Odstranění parametru",
      message: `Opravdu chcete odstranit parametr ${param.description}?`,
      btn1: {
        label: 'Odstranit',
        value: 'yes',
        color: 'warn'
      },
      btn2: {
        label: 'Ne',
        value: 'no',
        color: 'light'
      }
    };
    const dialogRef = this.dialog.open(SimpleDialogComponent, { data: data });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.api.removeConditionParam(param).subscribe(() => {
          this.params.splice(this.params.indexOf(param), 1);
          this.ui.showInfoSnackBar("parametr byl odstraněn")
        },
        (error) => {
          this.ui.showInfoSnackBar("parametr se nepodřilo odstranit");
        });
      }
    });
  }

  onEditParam(param: ConditionParam) {
    const data: SimpleDialogData = {
      title: "Úprava názvu parametru",
      message: "",
      textInput: {
        label: "Název",
        value: param.description + ''
      },
      btn1: {
        label: 'Upravit',
        value: 'edit',
        color: 'primary'
      },
      btn2: {
        label: 'Zrušit',
        value: 'cancel',
        color: 'light'
      }
    };
    const dialogRef = this.dialog.open(SimpleDialogComponent, { data: data });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'edit' && data.textInput.value) {
        param.description = data.textInput.value;
        this.api.updateConditionParam(param).subscribe((cp: ConditionParam) => {
          console.log('cp', cp);
        });
      }
    });
  }



}
