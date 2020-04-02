export class Collection {

  id: string;
  name: string = "";
  description: string = "";
  content: string = "";

  createdAt: Date;
  modifiedAt: Date;

  constructor() {
  }

  static fromSolrJson(json): Collection {
    const collection = new Collection();
    collection.id = json['n.pid'];
    collection.name = json['n.title.search'];
    collection.description = json['n.collection.desc'];
    if (json['n.created']) {
      collection.createdAt = new Date(json['n.created']);
    }
    if (json['n.modified']) {
      collection.modifiedAt = new Date(json['n.modified']);
    }
    return collection;
  }

  static fromSolrJsonArray(json): Collection[] {
    const items = [];
    for (const obj of json) {
      items.push(Collection.fromSolrJson(obj));
    }
    return items;
  }

  static fromAdminApiJson(json): Collection {
    const collection = new Collection();
    collection.id = json['pid'];
    collection.name = json['name'];
    collection.description = json['description'];
    if (json['created']) {
      collection.createdAt = new Date(json['created']);
    }
    if (json['modified']) {
      collection.modifiedAt = new Date(json['modified']);
    }
    return collection;
  }

  static fromAdminApiJsonArray(json): Collection[] {
    const items = [];
    for (const obj of json) {
      items.push(Collection.fromAdminApiJson(obj));
    }
    return items;
  }

}
