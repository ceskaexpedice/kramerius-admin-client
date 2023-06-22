import { AbstractControl, ValidatorFn } from "@angular/forms";

export function licensesValidator(licenses:string[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value && licenses.includes(value)) {
        return { alreadyUsed: true };
      }
      return null;
    };
  }
