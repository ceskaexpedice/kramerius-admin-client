import { Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'appDatetime'
})
export class DatetimePipe implements PipeTransform {

  transform(value: any) {
    const date = new Date(value);
    if (!date || isNaN(date.getDate())) {
      return '';
    }
    return this.add0(date.getDate()) + '.'
         + this.add0((date.getMonth() + 1)) + '.'
         + date.getFullYear() + ' '
         + this.add0(date.getHours()) + ':'
         + this.add0(date.getMinutes());
  }

  private add0(value: number): string {
    if (value < 10) {
      return '0' + value;
    }
    return value.toString();
  }
}
