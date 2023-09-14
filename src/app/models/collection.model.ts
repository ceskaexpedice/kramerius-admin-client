export class Collection {

  id: string;
  names:any = {};
  descriptions:any = {};
  contents:any = {};

  standalone: boolean = false;

  createdAt: Date;
  modifiedAt: Date;

  items: string[];

  constructor() {
  }

  getName(lang: string) {
    return this.names[lang];
  }

  getDescription(lang: string) {
    return this.descriptions[lang];
  }

  // static fromSolrJson(json): Collection {
  //   const collection = new Collection();
  //   collection.id = json['pid'];
  //   collection.name = json['title.search'];
  //   collection.description = json['collection.desc'];
  //   if (json['created']) {
  //     collection.createdAt = new Date(json['created']);
  //   }
  //   if (json['modified']) {
  //     collection.modifiedAt = new Date(json['modified']);
  //   }
  //   return collection;
  // }

  // static fromSolrJsonArray(json): Collection[] {
  //   const items = [];
  //   for (const obj of json) {
  //     items.push(Collection.fromSolrJson(obj));
  //   }
  //   return items;
  // }

  static fromAdminApiJson(json): Collection {
    //console.log('json', json);
    const collection = new Collection();
    collection.id = json['pid'];
    //collection.name_cze = json['name_cze'] || "";
    //collection.name_eng = json['name_eng'] || "";
    collection.names = json['names'] || {};

    //collection.description_cze = json['description_cze'];
    //collection.description_eng = json['description_eng'];
    collection.descriptions = json['descriptions'] || {};


    //collection.content_cze = json['content_cze'] || "";
    //collection.content_eng = json['content_eng'] || "";
    collection.contents = json['contents'] || {};


    collection.standalone = json['standalone'];
    if (json['created']) {
      collection.createdAt = new Date(json['created']);
    }
    if (json['modified']) {
      collection.modifiedAt = new Date(json['modified']);
    }
    collection.items = json['items'];
    return collection;
  }

  static fromAdminApiJsonArray(lang:string, json): Collection[] {
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
