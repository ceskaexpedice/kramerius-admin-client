import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateOrEditLicenseDialogComponent } from 'src/app/dialogs/create-or-edit-license-dialog/create-or-edit-license-dialog.component';
import { SimpleDialogData } from 'src/app/dialogs/simple-dialog/simple-dialog';
import { SimpleDialogComponent } from 'src/app/dialogs/simple-dialog/simple-dialog.component';
import { License } from 'src/app/models/license.model';
import { AdminApiService } from 'src/app/services/admin-api.service';
import { UIService } from 'src/app/services/ui.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ClientApiService } from 'src/app/services/client-api.service';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule,
    MatIconModule, MatTabsModule, MatCardModule, MatTooltipModule, MatProgressBarModule, DragDropModule, MatButtonModule
     ],
  selector: 'app-licenses',
  templateUrl: './licenses.component.html',
  styleUrls: ['./licenses.component.scss']
})
export class LicensesComponent implements OnInit {

  // must be set 
  libraryName: string = 'KNAV';

  state: string;

  licenses: any[];
  //globalLicenses:any[];

  errorMessage: string;
  errorState: boolean = false;

  public isItemChildDraged: boolean;

  constructor(private api: AdminApiService, 
    private ui: UIService,
    private clientApi: ClientApiService,
    private dialog: MatDialog) {}

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.state = 'loading';

    this.clientApi.getInfo().subscribe(data => {
      if (data['instance'] && data['instance']['acronym']) {
        this.libraryName = data['instance']['acronym'];
       } else {
        this.libraryName = null;
       }
    });



    this.api.getAllLicenses().subscribe((licenses: License[]) => {
      this.licenses = licenses;
      this.state = 'success';
    }, (error: HttpErrorResponse) => {
      this.errorState = true;
      this.errorMessage = error.error.message;
    });
  }

  acronymSet() {
    return this.libraryName && this.libraryName != '';
  }

  isValidLicense(license:License) {

  }



  onNewLicence() {
    const dialogRef = this.dialog.open(CreateOrEditLicenseDialogComponent, {

      data : { 
          libraryName: this.libraryName,
          licenseNames: this.licenses.map((lic) => lic.name).concat(this.licenses.map((lic) => lic.name))
      },
      width: '800px',
      panelClass: 'app-create-or-edit-license-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.license) {
        const license = result.license;
        this.licenses.push(license);
        this.sortLicenses();
        this.ui.showInfoSnackBar('snackbar.success.createOrEditLicense');
        (error: any) => {
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
      //console.log('moveDown', result);
      this.reload();
    });
  }

  onEditLicese(license: License) {
    const dialogRef = this.dialog.open(CreateOrEditLicenseDialogComponent, {
      data: { 
        license: license,
        libraryName: this.libraryName,
        licenseNames: this.licenses.map((lic) => lic.name).concat(this.licenses.map((lic) => lic.name))
      },
      width: '800px',
      panelClass: 'app-create-or-edit-license-dialog'
    } );
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.license) {
        this.ui.showInfoSnackBar('snackbar.success.onEditLicese');
        license.copyFrom(result.license);
        this.sortLicenses();
        // this.reload();
        (error: any) => {
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

  changeOrder() {
    this.api.changeLicenseOrdering(this.licenses).subscribe(result => {
      this.isItemChildDraged = false;
      this.ui.showInfoSnackBar(`snackbar.success.changeItemsOrderSaved`);
      this.reload();
    });

  }

  // drag and drop sorting
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.licenses, event.previousIndex, event.currentIndex);
    if (event.previousIndex !== event.currentIndex) {
      this.ui.showInfoSnackBar(`snackbar.success.changeItemsOrder`);
      let priorities = this.licenses.map(l=>  parseInt(l.priority));

      priorities = priorities.sort((a, b) => {
        return a - b;
      });

      for(let i =0;i<priorities.length;i++) {
        this.licenses[i].priority = priorities[i];
      }

      this.isItemChildDraged = true;
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


}
