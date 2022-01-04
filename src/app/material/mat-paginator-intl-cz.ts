import { MatPaginatorIntl } from '@angular/material/paginator';
import { Injectable } from "@angular/core";

@Injectable()
export class MatPaginatorIntlCz extends MatPaginatorIntl {
    itemsPerPageLabel = 'Položek na stránku';
    nextPageLabel = 'Další stránka';
    previousPageLabel = 'Předchozí stránka';

    getRangeLabel = function (page, pageSize, length) {
        if (length === 0 || pageSize === 0) {
            return `0 z ${this.formatNumber(length)}`
        }
        length = Math.max(length, 0);
        const startIndex = page * pageSize;
        // If the start index exceeds the list length, do not try and fix the end index to the end.
        const endIndex = startIndex < length ?
            Math.min(startIndex + pageSize, length) :
            startIndex + pageSize;

        return `${this.formatNumber(startIndex + 1)} - ${this.formatNumber(endIndex)} z ${this.formatNumber(length)}`
    };

    formatNumber(num: number) {
        return String(num);
    }

}