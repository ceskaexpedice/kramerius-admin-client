import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';

@Injectable()
export class UIService {


  constructor(private snackBar: MatSnackBar) {
  }

  showInfoSnackBar(message: string, duration: number = 2000) {
    this.snackBar.open(message, 'OK', { duration: duration });
  }

  showErrorSnackBar(message: string, duration: number = 3000) {
    this.snackBar.open(message, 'Chyba', { duration: duration, verticalPosition: 'top' });
  }

}
