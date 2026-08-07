export class KappSync {
    numberOfRec:number;
    docs:KappItem[];

    static fromJson(json: any): KappSync {
      const result = new KappSync();
      result.numberOfRec = json['numFound'];
      result.docs = KappItem.fromJsonArray(json['docs']);
      return result;
    }
}

export class KappItem {
    id: string;
    pid: string;
    title:string;
    model:string;
    date_issued_year:string;
    state: string;
    license:string;
    type: string;
    process_id:any;
    process_uuid:string;
    sync_actions:string[];
    real_kram_titles_search:any;
    real_kram_date:string;
    real_kram_model:string;
    children:KappItem[];
    parent_id:string;

    static fromJsonArray(jsonArray: any): KappItem[] {
        const result = [];
        for (const obj of jsonArray || []) {
          result.push(KappItem.fromJson(obj));
        }
        return result;
    }

    static fromJson(json: any): KappItem {
        const item = new KappItem();
        item.id = json['id'];
        item.pid = json['pid'];
        item.title = json['title'];
        item.model = json['model'];
        item.date_issued_year = json['date_issued_year'];
        item.state = json['state'];
        item.license = json['license'];
        item.type = json['type'];
        item.sync_actions = json['sync_actions'];
        item.real_kram_titles_search = json['real_kram_titles_search'];
        item.real_kram_date = json['real_kram_date'];
        item.real_kram_model = json['real_kram_model'];

        if (json['parent_id']) {
          item.parent_id = json['parent_id'];
        }

        if (json['process_id']) {
          item.process_id = json['process_id'];
        }

        if (json['process_uuid']) {
          item.process_uuid = json['process_uuid'];
        }

        return item;
    }
}
