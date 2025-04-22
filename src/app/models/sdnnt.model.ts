export class SdnntSync {
    numberOfRec:number;
    docs:SdnntItem[];    

    static fromJson(json: any): SdnntSync {
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
    process_id:string;
    process_uuid:string;

    
    real_kram_licenses:string[];
    real_kram_titles_search:string[];
    real_kram_date:string;
    real_kram_model: string;
    
    controlField_date1:string;
    controlField_date2: string;
    controlField_typeofdate: string;

    sync_actions:string[]; 

    children:SdnntItem[];
    parent_id:string;

    has_granularity:boolean;



    get sdnntCatalog() {
      if (this.catalog) {
        return this.catalog.substring("	oai:aleph-nkp.cz:".length-1);
      } else return 'Neuvedeno';
    }

    get sdnntModel() {
      if (this.type_of_rec == 'BK') {
        if (this.has_granularity) {
          return 'multivolumemonograph'
        } else {
          return 'monograph'
        }
      } else {
        return 'periodical'
      }
    }

    get sdnntDate() {
      if (this.has_granularity) {
        if (this.controlField_date2 === '9999' || this.controlField_date2 === '   ') {
          return this.controlField_date1;
        } else {
          return  this.controlField_date1+'-'+this.controlField_date2;
        }
      } else {
        return this.controlField_date1;
      }
    }

    static fromJsonArray(jsonArray: any): SdnntItem[] {
        const result = [];
        for (const obj of jsonArray) {
          result.push(SdnntItem.fromJson(obj));
        }
        return result;
    }

    static fromJson(json: any): SdnntItem {
        const item = new SdnntItem();
        item.id = json['id'];
        item.pid = json['pid'];
        item.catalog = json['catalog'];
        item.state = json['state'];
        item.type = json['type'];
        item.type_of_rec = json['type_of_rec'];
        item.license = json['license'];
        item.title = json['title'];
        item.sync_actions=json['sync_actions'];
        item.real_kram_date = json['real_kram_date'];
        item.real_kram_model = json['real_kram_model'];
        item.real_kram_titles_search = json['real_kram_titles_search'];

        item.has_granularity = json['has_granularity'] ? json['has_granularity'] : false;

        item.controlField_date1 = json['controlField_date1'];
        item.controlField_date2 = json['controlField_date2'];
        item.controlField_typeofdate = json['controlField_typeofdate'];



        if (json['parent_id']) {
          item.parent_id = json['parent_id']
        }

        if (json['process_id']) {
          item.process_id = json['process_id']
        }

        if (json['process_uuid']) {
          item.process_uuid = json['process_uuid']
        }

        return item;
    }
}



