
export class ConditionParam {

  id: number;
  description: string;
  values: string[];

  constructor() {
    this.description = '';
    this.values = [];
  }

  static fromJson(json: any): ConditionParam {
    const param = new ConditionParam();
    param.id = json['id'];
    param.description = json['description'] || '';
    param.values = json['objects'] || [];
    return param;
  }

  static fromJsonArray(json: any): ConditionParam[] {
    const result = [];
    for (const obj of json) {
      result.push(ConditionParam.fromJson(obj));
    }
    return result;
  }

  copyFrom(param: ConditionParam) {
    this.id = param.id;
    this.values = [];
    for (const value of param.values) {
      this.values.push(value);
    }
    this.description = param.description || '';
  }

  toJson() {
    const json: any = {
      description: this.description || '',
      objects: this.values     
    }
    if (this.id) {
      json['id'] = this.id;
    }
    return json;
  }


}
