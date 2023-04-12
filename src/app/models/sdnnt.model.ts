export class SdnntSync {
    numberOfRec:number;
    docs:SdnntItem[];    

    static fromJson(json): SdnntSync {
      const result = new SdnntSync();
      result.numberOfRec = json['numFound'];
      result.docs = SdnntItem.fromJsonArray(json['docs'])
      return result;
    }


}



export class SdnntItem {

    id: string;
    catalog: string;
    title:string;
    type_of_rec:string;
    state: string;
    pid: string;
    license:string;
    type: string;
    real_kram_licenses:string[];
    sync_actions:string[]; 

    children:SdnntItem[];
    parent_id:string;

    //children: any;

    static fromJsonArray(jsonArray): SdnntItem[] {
        const result = [];
        for (const obj of jsonArray) {
          result.push(SdnntItem.fromJson(obj));
        }
        return result;
    }

    static fromJson(json): SdnntItem {
        const item = new SdnntItem();
        item.id = json['id'];
        item.pid = json['pid'];
        item.catalog = json['catalog'];
        item.state = json['state'];
        item.type = json['type'];
        item.type_of_rec = json['type_of_rec'];
        item.license = json['license'];
        item.title = json['title'];
        item.title = json['title'];
        item.sync_actions=json['sync_actions'];

        if (json['parent_id']) {
          item.parent_id = json['parent_id']
        }
    
        return item;
    }
}



