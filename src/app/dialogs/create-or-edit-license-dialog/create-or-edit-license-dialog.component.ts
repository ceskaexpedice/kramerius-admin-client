import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { License } from "src/app/models/license.model";
import { AdminApiService } from "src/app/services/admin-api.service";

@Component({
  selector: 'app-create-or-edit-license-dialog',
  templateUrl: './create-or-edit-license-dialog.component.html',
  styleUrls: ['./create-or-edit-license-dialog.component.scss']
})
export class CreateOrEditLicenseDialogComponent implements OnInit {

  license: License;
  mode: string;
  errorMessage: string;

  constructor(public dialogRef: MatDialogRef<CreateOrEditLicenseDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private api: AdminApiService) {
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