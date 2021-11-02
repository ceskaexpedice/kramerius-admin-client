import { NgModule } from '@angular/core';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatPaginatorIntlCz } from './mat-paginator-intl-cz';

import {
  MatCardModule,
  MatToolbarModule,
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatMenuModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatCheckboxModule,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
  DateAdapter,
  MatTableModule,
  MatPaginatorModule,
  MatPaginatorIntl,
  MatTooltipModule,
  MatSelectModule,
  MatDialogModule,
  MatTabsModule,
  MatSnackBarModule,
  MatRadioModule,
  MatSlideToggleModule,
  MatButtonToggleModule
} from '@angular/material';


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
  MatSlideToggleModule
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
