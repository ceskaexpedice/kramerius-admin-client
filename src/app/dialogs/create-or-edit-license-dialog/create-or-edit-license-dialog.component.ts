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
  // all licenses names
  licenseNames: string[];
  // library prefix 
  libraryName:string;
  // license  
  license: License;
  mode: string;
  errorMessage: string;

  // lock turn on
  turnOnLock: boolean;

  lockTypeChanged:boolean = false;
  
  // expansion flag - consumed licenses
  isConsumedLicensesExpanded: boolean = false;
  // lock map to display 
  lockMaps:any[] = [];

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

      // default value for exclusive lock
      this.license.exclusiveLock = false;
      this.license.refresh = 20;
      this.license.max = 10000;
      this.license.readers = 1;
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

  
  formatedMaxTime() {
    if (this.license.max > 0) {
      return "Zadáno v sekundách - "+this.formatTime(this.license.max);
    }
  }
  
  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    const hoursStr = hours === 1 ? '1 hodina' : `${hours} hodiny`;
    const minutesStr = minutes === 1 ? '1 minuta' : `${minutes} minuty`;
    const secondsStr = remainingSeconds === 1 ? '1 sekunda' : `${remainingSeconds} sekundy`;
    
    const timeComponents = [];
    if (hours > 0) {
        timeComponents.push(hoursStr);
    }
    if (minutes > 0) {
        timeComponents.push(minutesStr);
    }
    timeComponents.push(secondsStr);

    return timeComponents.join(' a ');
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
        this.errorMessage = this.ui.getTranslation('alert.createOrEditLicense.error1');
      } else {
        this.errorMessage = this.ui.getTranslation('alert.createOrEditLicense.error2');
      }
    });
  }

  onCancel() {
      this.cancel();
  }

  cancel() {
    this.dialogRef.close();
  }

  /** Fetch information about consumed licenses */
  viewConsumedLicenses() {
    if (!this.lockTypeChanged) {
      this.isConsumedLicensesExpanded =! this.isConsumedLicensesExpanded;
      if (this.isConsumedLicensesExpanded) {
        this.api.getLocksByLicense(this.license.name).subscribe(res=>{
          this.lockMaps = res;        
          this.lockMaps.forEach(lm=> {
              this.api.getLocksItems(lm["hash"]).subscribe(res=>{

                const now = new Date();
                const filteredItems = res['items'].filter(item => {
                  const maxTime = new Date(item.maxTime); 
                  return maxTime > now; 
                });

                lm['items'] = filteredItems;

                if ( lm['items'].length > 0) {
                  lm['enabled'] = true;
                } else {
                  lm['enabled'] = false;
                }
              });
          });
        });
      } else {
        this.lockMaps = [];
      }
    }
  }

  lockTypeChange() {
    // new hash, save first
    this.lockTypeChanged = true;
    this.isConsumedLicensesExpanded  = false;
  }

  /** Generic format date */
  formatDateTime(inputDateString: string): string {
    const dateObject = new Date(inputDateString);
    const formattedDate = `${dateObject.getFullYear()}-${(dateObject.getMonth() + 1).toString().padStart(2, '0')}-${dateObject.getDate().toString().padStart(2, '0')} ${dateObject.getHours().toString().padStart(2, '0')}:${dateObject.getMinutes().toString().padStart(2, '0')}:${dateObject.getSeconds().toString().padStart(2, '0')}.${dateObject.getMilliseconds().toString().padStart(3, '0')}`;

    return formattedDate;
  } 

  /** Generic format difference dates */
  formatTimeDifference(inputDateString: string): string {
    const inputDate = new Date(inputDateString);
    const currentDate = new Date();

    const timeDifference = Math.abs(currentDate.getTime() - inputDate.getTime());

    const secondsDifference = Math.floor(timeDifference / 1000);
    const minutesDifference = Math.floor(secondsDifference / 60);
    const hoursDifference = Math.floor(minutesDifference / 60);
    const daysDifference = Math.floor(hoursDifference / 24);

    let formattedDifference = '';

    if (daysDifference > 0) {
        formattedDifference += `${daysDifference} days, `;
    }
    if (hoursDifference % 24 > 0) {
        formattedDifference += `${hoursDifference % 24} hours, `;
    }
    if (minutesDifference % 60 > 0) {
        formattedDifference += `${minutesDifference % 60} minutes, `;
    }
    if (secondsDifference % 60 > 0) {
        formattedDifference += `${secondsDifference % 60} seconds`;
    }

    return formattedDifference;
}



}