import { NgModule } from '@angular/core';

import { 
  MatToolbarModule,
  MatButtonModule,
  MatIconModule,
  MatInputModule, 
  MatProgressSpinnerModule,
  MatMenuModule
} from '@angular/material';


const components = [
  MatButtonModule,
  MatToolbarModule,
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatMenuModule
];

@NgModule({
  imports: components,
  exports: components
})
export class MaterialModule { }
