import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateOrEditLicenseDialogComponent } from 'src/app/dialogs/create-or-edit-license-dialog/create-or-edit-license-dialog.component';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { License } from 'src/app/models/license.model';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { UIService } from 'src/app/services/ui.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-licenses',
  templateUrl: './licenses.component.html',
  styleUrls: ['./licenses.component.scss']
})
export class LicensesComponent implements OnInit {

  libraryName: string = 'KNAV';

  state: string;
  licenses: any[];

  errorMessage: string;
  errorState: boolean = false;

  constructor(private api: AdminApiService, 
    private ui: UIService,
    private dialog: MatDialog) {}

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.state = 'loading';
    this.api.getLicenses().subscribe((licenses: License[]) => {
      this.licenses = licenses;
      this.state = 'success';
    }, (error: HttpErrorResponse) => {
      this.errorState = true;
      this.errorMessage = error.error.message;
    });
  }

  onNewLicence() {
    const dialogRef = this.dialog.open(CreateOrEditLicenseDialogComponent, {
      width: '600px',
      panelClass: 'app-create-or-edit-license-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.license) {
        const license = result.license;
        this.licenses.push(license);
        this.sortLicenses();
        this.ui.showInfoSnackBar('snackbar.success.createOrEditLicense');
        (error) => {
          if (error) {
            this.ui.showErrorSnackBar('snackbar.errorcreateOrEditLicense');
          }
        }
      }
    });
  }

  onRemoveLicese(license: License) {
    const data: SimpleDialogData = {
      title: this.ui.getTranslation('modal.onRemoveLicese.title'),
      message: this.ui.getTranslation('modal.onRemoveLicese.message', {value: license.name}),
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
        this.api.removeLicense(license).subscribe(() => {
          this.licenses.splice(this.licenses.indexOf(license), 1);
          this.ui.showInfoSnackBar('snackbar.success.onRemoveLicese')
        },
        (error) => {
          if (error && error.error && error.error.status == 409) {
            this.ui.showInfoSnackBar('snackbar.error.onRemoveLicese.409');
          } else {
            this.ui.showInfoSnackBar('snackbar.error.onRemoveLicese.failed');
          }
        });
      }
    });
  }

  onMoveLiceseUp(license: License) {
    this.api.moveLicenseUp(license).subscribe(result => {
      console.log('moveUp', result);
      this.reload();
    });
  }

  onMoveLiceseDown(license: License) {
    this.api.moveLicenseDown(license).subscribe(result => {
      console.log('moveDown', result);
      this.reload();
    });
  }

  onEditLicese(license: License) {
    const dialogRef = this.dialog.open(CreateOrEditLicenseDialogComponent, {
      data: { license: license },
      width: '600px',
      panelClass: 'app-create-or-edit-license-dialog'
    } );
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.license) {
        this.ui.showInfoSnackBar('snackbar.success.onEditLicese');
        license.copyFrom(result.license);
        this.sortLicenses();
        // this.reload();
        (error) => {
          if (error) {
            this.ui.showErrorSnackBar('snackbar.error.onEditLicese');
          }
        }
      }
    });
  }

  private sortLicenses() {
    this.licenses.sort((a: License, b: License) => {
      return a.priority - b.priority;
    });
  }

}
