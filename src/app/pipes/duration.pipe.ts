import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'appDuration'
})
export class DurationPipe implements PipeTransform {

  transform(value: any): any {
    if (value === null || isNaN(value)) {
      return '';
    }
    let seconds = Math.round(value / 1000);
    if (seconds >= 60) {
      let minutes = Math.floor(seconds / 60);
      seconds = seconds - minutes * 60;
      if (minutes >= 60) {
        let hours = Math.floor(minutes / 60);
        minutes = minutes - hours * 60;
        return `${hours}:${this.with2Digits(minutes)}:${this.with2Digits(seconds)}`
      } else {
        return `${minutes}:${this.with2Digits(seconds)}`
      }
    } else {
      return `${seconds} s`
    }
  }

  with2Digits(num: number) {
    return num >= 10 ? num : "0" + num;
  }

}
