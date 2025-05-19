
export class License {


  id: number;
  name: string;
  description: string;
  priority: number;
  group:string;

  // exclusive lock
  exclusiveLock: boolean = false;
  refresh:number = -1;
  max:number = -1;
  readers: number = -1;
  type ="instance";

  // runtime
  runtime: boolean = false;
  runtimeType: string;

  // Type of runtime licenses 
  ALL_RUNTIME_TYPES:string[] = ['ALL_DOCUMENTS','COVER_AND_CONTENT_MONOGRAPH_PAGE'];


  constructor() {
    this.id = 0;
    this.priority = 0;
  }

  static fromJson(json: any): License {
    const license = new License();
    license.id = json['id'];
    license.name = json['name'];
    license.description = json['description'] || '';
    license.priority = json['priority'];
    license.group = json['group'];

    /*
    private static final String MAXREADERS_KEY = "maxreaders";
    private static final String REFRESHINTERVAL_KEY = "refreshinterval";
    private static final String MAXINTERVAL_KEY = "maxinterval";
    private static final String EXCLUSIVE_KEY = "exclusive";
    */

    license.exclusiveLock=json["exclusive"];
    license.refresh=json["refreshinterval"];
    license.max=json["maxinterval"];
    license.readers=json["maxreaders"];
    license.type = json["type"];

    license.runtime = json["runtime"];
    license.runtimeType = json["runtime_type"]


    return license;

  }

  static fromJsonArray(json: any): License[] {
    const result = [];
    for (const obj of json) {
      result.push(License.fromJson(obj));
    }
    return result;
  }

  copyFrom(license: License) {
    this.id = license.id;
    this.priority = license.priority;
    this.name = license.name;
    this.description = license.description || '';
    
    this.exclusiveLock = license.exclusiveLock;
    this.refresh = license.refresh;
    this.max = license.max;
    this.readers = license.readers;
    this.type = license.type;

    this.runtime = license.runtime;
    this.runtimeType = license.runtimeType;

  }

  toJson() {
    let retval: any =  {
      id: this.id,
      priority: this.priority,
      name: this.name,
      description: this.description || ''
    };

    if (this.exclusiveLock) {
      retval['exclusive']= true;
      retval['refreshinterval']= this.refresh;
      retval['maxinterval']= this.max;
      retval['maxreaders']= this.readers;
      retval['type'] = this.type;
    }

    if (this.runtime) {
      retval["runtime"] = true;
      retval["runtime_type"] = this.runtimeType;

    }

    return retval;
  }


}
