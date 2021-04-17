export class Collection {

  id: string;
  name_cze: string = "";
  name_eng: string = "";
  description_cze: string = "";
  description_eng: string = "";
  content_cze: string = "";
  content_eng: string = "";
  standalone: boolean = false;

  createdAt: Date;
  modifiedAt: Date;

  items: string[];

  constructor() {
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
    const collection = new Collection();
    collection.id = json['pid'];
    collection.name_cze = json['name_cze'] || "";
    collection.name_eng = json['name_eng'] || "";
    collection.description_cze = json['description_cze'];
    collection.description_eng = json['description_eng'];
    collection.content_cze = json['content_cze'] || "";
    collection.content_eng = json['content_eng'] || "";
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

  static fromAdminApiJsonArray(json): Collection[] {
    const items = [];
    for (const obj of json) {
      items.push(Collection.fromAdminApiJson(obj));
    }
    items.sort((a: Collection, b: Collection) => {
      return a.name_cze.localeCompare(b.name_cze)
    });
    return items;
  }

}
