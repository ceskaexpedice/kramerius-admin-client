import { Right } from "./right.model";

export class RightAction {

  code: string;
  description: string;
  rights: Right[];

  constructor(code: string, description: string) {
    this.rights = [];
    this.code = code;
    this.description = description;
  }

  addRight(right: Right) {
    this.rights.push(right)
  }

  static fromJsonArray(json: any): RightAction[] {
    const result = [];
    const acts = json["actions"];
    for (const a of acts) {
      result.push(new RightAction(a, a));
    }
    return result;
  }

  static fromPidsMap(json: any):Map<string,RightAction[]>  {
    const result: any = new Map<string,RightAction[]>();     
    for (const key of Object.keys(json)) {
      let actions = json[key].map((it:string) => new RightAction(it,it));
      result[key] = actions;
    }
    return result;
  }


}

