
import { Injectable } from '@angular/core';

@Injectable()
export class LocalStorageService {

    constructor() {
    }

    getStringProperty(property: string, defaultValue: string = null): string {
        const value = localStorage.getItem(property);
        if (value == "") {
            return "";
        }
        return localStorage.getItem(property) || defaultValue;
    }

    setStringProperty(property: string, value: string) {
        return localStorage.setItem(property, value);
    }
    getBoolProperty(property: string, defaultValue: boolean = false) {
        const prop = this.getStringProperty(property);
        if (prop) {
            return prop === '1';
        } else {
            return defaultValue;
        }
    }

    setBoolProperty(property: string, value: boolean) {
        this.setStringProperty(property, value ? '1' : '0');
    }

}
