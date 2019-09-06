import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material';

const components = [
  MatButtonModule
];

@NgModule({
  imports: components,
  exports: components
})
export class MaterialModule { }
