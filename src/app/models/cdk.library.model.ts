export class Library {
    status:boolean = true;
    code:string;

    constructor(status: boolean, code: string) {
        this.code = code;
        this.status = status;
    }
    



    static libsFromJson(json):Library[]  {
        let retval = [];
        for (const key of Object.keys(json)) {
          retval.push(new Library(json[key].status, key));
        }
        retval.forEach(l=> {
          console.log(l.status);
        });
        return retval;
    }
    
    static oneLibFromJson(code, json):Library  {
      return new Library(code, json.status);
    }

}

