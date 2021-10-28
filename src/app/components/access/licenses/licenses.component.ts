import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { NewLicenseDialogComponent } from 'src/app/dialogs/new-license-dialog/new-license-dialog.component';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { License } from 'src/app/models/license.model';
import { Admin2ApiService } from 'src/app/services/admin2-api.service';
import { UIService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-licenses',
  templateUrl: './licenses.component.html',
  styleUrls: ['./licenses.component.scss']
})
export class LicensesComponent implements OnInit {

  licenses: any[];

  constructor(private api: Admin2ApiService, 
    private ui: UIService,
    private dialog: MatDialog) {}

  ngOnInit() {
    this.api.getLicenses().subscribe((licenses: License[]) => {
      this.licenses = licenses;
      console.log('licenses', licenses);
    });
  }

  onNewLicence() {
    const dialogRef = this.dialog.open(NewLicenseDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
        if (result && result.license) {
            const license = result.license;
            this.licenses.push(license);
            this.sortLicenses();
        }
    });
  }

  onRemoveLicese(license: License) {
    const data: SimpleDialogData = {
      title: "Odstranění licence",
      message: `Opravdu chcete odstranit licenci ${license.name}?`,
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
        this.api.removeLicense(license).subscribe(() => {
          this.licenses.splice(this.licenses.indexOf(license), 1);
          this.ui.showInfoSnackBar("Licence byla odstraněna")
        });
      }
    });
  }

  onEditLicese(license: License) {
    const dialogRef = this.dialog.open(NewLicenseDialogComponent, {
      data: { license: license }
    } );
    dialogRef.afterClosed().subscribe(result => {
        if (result && result.license) {
          license.copyFrom(result.license);
          this.sortLicenses();
        }
    });
  }

  private sortLicenses() {
    this.licenses.sort((a: License, b: License) => {
      return a.priority - b.priority;
    });
  }

}
