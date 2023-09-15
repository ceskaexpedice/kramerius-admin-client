import { NgModule } from '@angular/core';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatPaginatorIntlCz } from './mat-paginator-intl-cz';

import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule, MAT_DATE_LOCALE, MAT_DATE_FORMATS, DateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSortModule } from '@angular/material/sort';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { DragDropModule } from '@angular/cdk/drag-drop';


const components = [
  MatCardModule,
  MatButtonModule,
  MatToolbarModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatIconModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatMenuModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatInputModule,
  MatCheckboxModule,
  MatTableModule,
  MatPaginatorModule,
  MatTooltipModule,
  MatSelectModule,
  MatDialogModule,
  MatTabsModule,
  MatSnackBarModule,
  MatRadioModule,
  MatSlideToggleModule,
  MatDividerModule,
  MatSortModule,
  ClipboardModule,
  DragDropModule
];

const providers = [
  MatDatepickerModule,
  { provide: MatPaginatorIntl, useClass: MatPaginatorIntlCz },
  { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  { provide: MAT_DATE_LOCALE, useValue: 'cs-CZ' },
];

@NgModule({
  imports: components,
  exports: components,
  providers: providers,
})
export class MaterialModule { }
