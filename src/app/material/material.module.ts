import { NgModule } from '@angular/core';
//import { MatMomentDateModule } from "@angular/material-moment-adapter";


import {
  MatToolbarModule,
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatMenuModule,
  MatDatepickerModule,
  MatNativeDateModule,
  //MatMomentDateModule,
  MatCheckboxModule,
  MAT_DATE_LOCALE,
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
  MatNativeDateModule,
  //MatMomentDateModule,
  MatInputModule,
  MatCheckboxModule,
];

const providers = [
  MatDatepickerModule,
  {provide: MAT_DATE_LOCALE, useValue: 'cs-CZ'},
];

@NgModule({
  imports: components,
  exports: components,
  providers: providers,
})
export class MaterialModule { }
