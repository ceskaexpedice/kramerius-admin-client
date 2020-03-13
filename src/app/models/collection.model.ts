export class Collection {

  id: string;
  name: string = "";
  description: string = "";
  content: string = "";

  createdAt: Date;
  modifiedAt: Date;

  constructor() {
  }

  static fromJson(json): Collection {
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

  static fromJsonArray(json): Collection[] {
    const items = [];
    for (const obj of json) {
      items.push(Collection.fromJson(obj));
    }
    return items;
  }

}
