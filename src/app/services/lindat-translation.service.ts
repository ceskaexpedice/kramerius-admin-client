import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LindatTranslationService {
  private readonly url = 'https://lindat.mff.cuni.cz/services/translation/api/v2/languages/';

  constructor(private http: HttpClient) { }

  translate(inputText: string, src: string, tgt: string): Observable<string> {
    const params = new HttpParams().set('src', src).set('tgt', tgt);
    const body = new HttpParams().set('input_text', inputText).toString();

    return this.http.post(this.url, body, {
      params,
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/plain, application/json'
      }),
      responseType: 'text'
    }).pipe(map(response => {
      // The API can return plain text or a JSON string/array, depending on content negotiation.
      try {
        const parsed = JSON.parse(response);
        return Array.isArray(parsed) ? parsed[0] : parsed;
      } catch {
        return response;
      }
    }));
  }
}
