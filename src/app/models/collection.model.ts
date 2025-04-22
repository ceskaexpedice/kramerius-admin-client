export class Collection {

  // thumbnail :  "thumb"
  id: string;
  names:any = {};
  descriptions:any = {};
  contents:any = {};
  keywords:any={};
  author:string = "";
  thumbnail:"none";

  standalone: boolean = false;

  createdAt: Date;
  modifiedAt: Date;
  // objects
  items: string[];
  // clippings
  clipitems:any[];

  constructor() {
  }

  getName(lang: string) {
    return this.names[lang];
  }

  getDescription(lang: string) {
    return this.descriptions[lang];
  }


  static fromAdminApiJson(json: any): Collection {
    const collection = new Collection();
    collection.id = json['pid'];
    collection.names = json['names'] || {};

    collection.descriptions = json['descriptions'] || {};
    collection.keywords = json['keywords'] || {};

    collection.contents = json['contents'] || {};
    collection.author = json['author'] || "";

    collection.standalone = json['standalone'];
    if (json['created']) {
      collection.createdAt = new Date(json['created']);
    }
    if (json['modified']) {
      collection.modifiedAt = new Date(json['modified']);
    }
    if (json["thumbnail"]) {
      collection.thumbnail = json['thumbnail'] || 'none';
    }
    collection.items = json['items'];

    collection.clipitems = json['clippingitems'] || [];

    return collection;
  }

  static fromAdminApiJsonArray(lang:string, json: any): Collection[] {
    const items = [];
    for (const obj of json) {
      items.push(Collection.fromAdminApiJson(obj));
    }
    items.sort((a: Collection, b: Collection) => {
      let aName = a.names[lang] || '';
      let bName = b.names[lang] || '';
      return aName.localeCompare(bName);
    });
    return items;
  }

}
