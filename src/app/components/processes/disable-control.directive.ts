import { Directive, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appDisableControl]'
})
export class DisableControlDirective {

  //see https://netbasal.com/disabling-form-controls-when-working-with-reactive-forms-in-angular-549dd7b42110

  @Input() set appDisableControl(condition: boolean) {
    const action = condition ? 'disable' : 'enable';
    this.ngControl.control[action]();
  }

  constructor(private ngControl: NgControl) {
  }

}
