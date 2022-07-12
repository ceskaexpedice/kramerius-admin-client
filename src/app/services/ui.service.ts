import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class UIService {
  currentLang: string = 'cs';
  private langSubject: Subject<boolean> = new Subject();
  public langChanged: Observable<boolean> = this.langSubject.asObservable();

  constructor(
    private snackBar: MatSnackBar,
    private translate: TranslateService
    ) {
  }

  showInfoSnackBar(message: string, duration: number = 2000) {
    this.snackBar.open(this.getTranslation(message), '', { duration: duration });
  }

  showErrorSnackBar(message: string, duration: number = 3000) {
    this.snackBar.open(message, 'Chyba', { duration: duration, verticalPosition: 'top' });
  }

  getTranslation(s: string): string {
    return this.translate.instant(s);
  }

  changeLang(lang: string) {
    this.translate.use(lang).subscribe(val => {
      this.currentLang = lang;
      localStorage.setItem("lang", this.currentLang);
      this.langSubject.next();
    });
  }

}
