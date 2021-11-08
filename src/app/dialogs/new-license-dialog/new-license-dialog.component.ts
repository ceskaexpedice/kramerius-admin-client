import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { License } from "src/app/models/license.model";
import { Admin2ApiService } from "src/app/services/admin2-api.service";

@Component({
  templateUrl: './new-license-dialog.component.html',
  styleUrls: ['./new-license-dialog.component.scss']
})
export class NewLicenseDialogComponent implements OnInit {

  license: License;
  mode: string;
  errorMessage: string;

  constructor(public dialogRef: MatDialogRef<NewLicenseDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private api: Admin2ApiService) {
  }

  ngOnInit() {
    this.license = new License();
    this.data = this.data || {};
    if (this.data.license) {
      this.mode = 'edit';
      this.license.copyFrom(this.data.license);
    } else {
      this.mode = 'new';
    }
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
        this.errorMessage = "Licence s tímto názvem už exituje, zadejte jiný název.";
      } else {
        this.errorMessage = "Licenci se nepodařilo vytvořit.";
      }
    });
  }

  private onUpdate() {
    this.api.updateLicense(this.license).subscribe((license: License) => {
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