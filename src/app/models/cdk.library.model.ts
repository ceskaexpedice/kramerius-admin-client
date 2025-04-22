

export class Reharvest{
  name:string;
  id:string;
  type:string;
  state:string;
  pid:string;
  indexed:string;
  libraries:string[];
  pod:string;

  getDateTime(): Date {
    return new Date(this.indexed);
  }

  static reharvestsFromJson(jsonArray: any):Reharvest[] {
    let retval: Reharvest[] = [];
    jsonArray.forEach((jsonObject: any)=> {
      retval.push(Reharvest.reharvestFromJson(jsonObject) );
    }); 
    return retval;
  }

  static reharvestFromJson(json: any):Reharvest {
    let reh = new Reharvest();
    if (json['id']) {
      reh.id = json['id'];
    }
    if (json['name']) {
      reh.name = json['name'];
    }
    if (json['type']) {
      reh.type = json['type'];
    }
    if (json['state']) {
      reh.state = json['state'];
    }
    if (json['pid']) {
      reh.pid = json['pid'];
    }
    if (json['indexed']) {
      reh.indexed = json['indexed'];
    }
    if (json['pod']) {
      reh.pod = json['pod'];
    }
    if (json['libraries']) {
      reh.libraries = json['libraries'];
    }
    return reh;
  }
}


export class Library {
    status:boolean = true;
    code:string;

    constructor(status: boolean, code: string) {
        this.code = code;
        this.status = status;
    }

    static libsFromJson(json: any):Library[]  {
        let retval = [];
        for (const key of Object.keys(json)) {
          retval.push(new Library(json[key].status, key));
        }
        /*
        retval.forEach(l=> {
          console.log(l.status);
        });
        */
        return retval;
    }
    
    static oneLibFromJson(code: string, json: any):Library  {
      return new Library(json.status, code);
    }

}

export class StatusTimtamp {

  date:string;
  indexed:number;
  updated:number;
  errors:number = 0;
  type:string = 'update';

  constructor(date:string, indexed:number, updated:number,errors:number) {
    this.date = date;
    this.indexed = indexed;
    this.updated = updated;
    this.errors = errors;
  } 

  static statusesFromJson(json: any): StatusTimtamp[] {
    let retval = [];
    for (const key of Object.keys(json)) {
      retval.push(this.oneStatus(json[key]));
    }
    return retval;
  }

  
  static oneStatus(json: any) {
    let stm =  new StatusTimtamp(json.date, json.indexed, json.updated, json.errors || 0);    
    if (json.type) {
      stm.type = json.type;
    }
    return stm;
  }

}

