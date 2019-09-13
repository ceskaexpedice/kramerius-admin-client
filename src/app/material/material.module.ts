import { NgModule } from '@angular/core';
//import { MatMomentDateModule } from "@angular/material-moment-adapter";
import { AppDateAdapter, APP_DATE_FORMATS } from '../components/processes/format-datepicker';


import {
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
} from '@angular/material';


const components = [
  MatButtonModule,
  MatToolbarModule,
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatMenuModule,
  MatDatepickerModule,
  //TODO: disable MatNativeDateModule and use MatMomentDateModule
  MatNativeDateModule,
  //MatMomentDateModule,
  MatInputModule,
  MatCheckboxModule,
  MatTableModule,
];

const providers = [
  MatDatepickerModule,
  { provide: MAT_DATE_LOCALE, useValue: 'cs-CZ' },
  // {provide: DateAdapter, useClass: AppDateAdapter},
  // {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
];

@NgModule({
  imports: components,
  exports: components,
  providers: providers,
})
export class MaterialModule { }
