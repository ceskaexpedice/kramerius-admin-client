import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
const components = [
  MatButtonModule,
  MatToolbarModule,
  MatButtonModule,
  MatIconModule
];

@NgModule({
  imports: components,
  exports: components
})
export class MaterialModule { }
