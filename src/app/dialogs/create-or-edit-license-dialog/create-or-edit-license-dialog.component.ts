import { Component, Inject, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { License } from "src/app/models/license.model";
import { AdminApiService } from "src/app/services/admin-api.service";
import { UIService } from 'src/app/services/ui.service';
import { licensesValidator } from "./licensesValidator";

@Component({
  selector: 'app-create-or-edit-license-dialog',
  templateUrl: './create-or-edit-license-dialog.component.html',
  styleUrls: ['./create-or-edit-license-dialog.component.scss']
})
export class CreateOrEditLicenseDialogComponent implements OnInit {

  licenseForm: FormGroup;

  licenseNames: string[];

  libraryName:string;
  
  license: License;
  mode: string;
  errorMessage: string;

  turnOnLock: boolean;

  constructor(public dialogRef: MatDialogRef<CreateOrEditLicenseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: AdminApiService,
    private ui: UIService,
    private formBuilder: FormBuilder) {
      this.libraryName = data['libraryName'];
      this.licenseNames = data['licenseNames'];
    }

  ngOnInit() {

    this.license = new License();
    this.data = this.data || {};
    if (this.data.license) {
      this.mode = 'edit';
      this.license.copyFrom(this.data.license);

      this.licenseForm = this.formBuilder.group({
        // no edit, no validation
        licenseName: ['', []],
        licenseDesc: ['', Validators.required]
      });

    } else {
      this.mode = 'new';
      this.license.name = this.libraryName+"_";
 
      this.licenseForm = this.formBuilder.group({
      
        licenseName: ['', [Validators.required, 
                          Validators.pattern('^'+this.libraryName+'_.*$')
                          ,licensesValidator(this.licenseNames)
                      ]],
        licenseDesc: ['', Validators.required]
      });
  
    }

 
    this.licenseName.markAsTouched();
    this.licenseDesc.markAsTouched();

  }

  get licenseName() {
    return this.licenseForm.get('licenseName');
  }

  get licenseDesc() {
    return this.licenseForm.get('licenseDesc');
  }

  
  onKeyUp() {
    this.licenseName.markAsTouched();
    this.licenseDesc.markAsTouched();
  }

  onSave() {
    if (!this.license.name) {
      return;
    }
    if (this.mode == 'edit') {
      this.onUpdate();
    } else if (this.mode == 'new') {
      this.onCreate();
    }
  }


  private onCreate() {


    this.api.createLicense(this.license).subscribe((license: License) => {
      this.dialogRef.close({ license: license });
    },
    (error) => {
      if (error && error.error && error.error.status == 409) {
        this.errorMessage = this.ui.getTranslation('alert.createOrEditLicense.error1');
      } else {
        this.errorMessage = this.ui.getTranslation('alert.createOrEditLicense.error2');
      }
    });
  }

  
  private onUpdate() {
    this.api.updateLocalLicense(this.license).subscribe((license: License) => {
      this.dialogRef.close({ license: license });
    },
    (error) => {
      if (error && error.error && error.error.status == 409) {
        this.errorMessage = "Licence s tímto názvem už exituje, zadejte jiný název.";
      } else {
        this.errorMessage = "Licenci se nepodařilo upravit.";
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