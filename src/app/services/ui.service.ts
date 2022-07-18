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

  showInfoSnackBar(message: string, params?: Object, duration: number = 2000) {
    this.snackBar.open(this.getTranslation(message, params), '', { duration: duration });
  }

  showErrorSnackBar(message: string, params?: Object, duration: number = 3000) {
    this.snackBar.open(this.getTranslation(message, params), this.getTranslation('desc.error'), { duration: duration, verticalPosition: 'top' });
  }

  getTranslation(s: string, interpolateParams?: Object): string {
    return this.translate.instant(s, interpolateParams);
  }

  changeLang(lang: string) {
    this.translate.use(lang).subscribe(val => {
      this.currentLang = lang;
      localStorage.setItem("lang", this.currentLang);
      this.langSubject.next();
    });
  }

}
