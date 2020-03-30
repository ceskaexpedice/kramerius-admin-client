import { Injectable } from '@angular/core';
import { parseString, processors } from 'xml2js';
import { Collection } from '../models/collection.model';

@Injectable()
export class ModsParserService {

    private static getText(element) {
        if (element) {
            let el = '';
            if (Array.isArray(element)) {
                if (element.length > 0) {
                    el = element[0]['_'];
                }
            } else {
                el = element['_'];
            }
            if (el) {
                return el.trim();
            }
        }
    }


    // getCollection(mods, uuid: string): Collection {
    //     const data = {tagNameProcessors: [processors.stripPrefix], explicitCharkey: true};
    //     let collection: Collection;
    //     parseString(mods, data, function (err, result) {
    //         collection = new Collection();
    //         collection.id = uuid;
    //         const root = result['modsCollection']['mods'][0];
    //         if (root['titleInfo'] && root['titleInfo'].length > 0) {
    //             collection.name = ModsParserService.getText(root['titleInfo'][0]['title']);
    //         }
    //         collection.description = ModsParserService.getText(root['abstract']) || '';
    //         collection.content = ModsParserService.getText(root['note']) || '';
    //     });
    //     return collection;
    // }

}
