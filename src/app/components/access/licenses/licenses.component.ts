import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NewLicenseDialogComponent } from 'src/app/dialogs/new-license-dialog/new-license-dialog.component';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { License } from 'src/app/models/license.model';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { UIService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-licenses',
  templateUrl: './licenses.component.html',
  styleUrls: ['./licenses.component.scss']
})
export class LicensesComponent implements OnInit {

  state: string;
  licenses: any[];

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
    });
  }

  onNewLicence() {
    const dialogRef = this.dialog.open(NewLicenseDialogComponent, {
      width: '600px',
      panelClass: 'app-new-license-dialog'
    });
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
    const dialogRef = this.dialog.open(SimpleDialogComponent, { 
      data: data,
      width: '600px',
      panelClass: 'app-simple-dialog'
     });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.api.removeLicense(license).subscribe(() => {
          this.licenses.splice(this.licenses.indexOf(license), 1);
          this.ui.showInfoSnackBar("Licence byla odstraněna")
        },
        (error) => {
          if (error && error.error && error.error.status == 409) {
            this.ui.showInfoSnackBar("Licence je použita, není možné ji odstranit");
          } else {
            this.ui.showInfoSnackBar("Licenci se nepodřilo odstranit");
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
    const dialogRef = this.dialog.open(NewLicenseDialogComponent, {
      data: { license: license },
      width: '600px',
      panelClass: 'app-new-license-dialog'
    } );
    dialogRef.afterClosed().subscribe(result => {
        if (result && result.license) {
          this.ui.showInfoSnackBar("Licence byla upravena.")
          license.copyFrom(result.license);
          this.sortLicenses();
          // this.reload();
        }
    });
  }

  private sortLicenses() {
    this.licenses.sort((a: License, b: License) => {
      return a.priority - b.priority;
    });
  }

}
