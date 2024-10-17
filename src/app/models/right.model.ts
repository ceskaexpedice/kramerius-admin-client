import { ConditionParam } from "./condition-param.model";
import { Role } from "./roles.model";

export class Right {
  id: number;
  pid: string;
  role: Role;
  condition: Condition;
  action: string;

  constructor() {
    this.pid = "uuid:1";
  }

  hasLicense(): boolean {
    return !!this.condition && !!this.condition.license;
  }

  copyFrom(right: Right) {
    this.id = right.id;
    this.pid = right.pid;
    this.action = right.action;
    if (right.role) {
      this.role = new Role();
      this.role.copyFrom(right.role);
    }
    if (right.condition) {
      this.condition = new Condition();
      this.condition.copyFrom(right.condition);
    } else {
      this.condition = null;
    }
  }

  static fromJson(json: any): Right {
    const right = new Right();
    right.id = json['id'];
    right.pid = json['pid'];
    right.action = json['action'];
    if (json['role']) {
      right.role = Role.fromJson(json['role']);
    }
    if (json['criterium']) {
      right.condition = Condition.fromJson(json['criterium']);
    }
    return right;
  }

  static fromJsonArray(json: any): Right[] {
    const result = [];
    for (const obj of json) {
      result.push(Right.fromJson(obj));
    }
    return result;
  }

  toJson() {
    const json: any = {
      action: this.action,
      role: this.role ? { name: this.role.name, id: this.role.id } : null,
      pid: this.pid
    }
    if (this.condition) {
      json['criterium'] = this.condition.toJson();
    }
    return json;
  }

  clone(): Right {
    const right = new Right()
    right.copyFrom(this);
    return right;
  }

}

export class Condition {

  code: string;
  name: string;
  license: string;
  params: ConditionParam;

  paramsNecessary: boolean;
  isLabelAssignable: boolean;
  rootLevelCriterum: boolean;

  static fromJson(json: any): Condition {
    const condition = new Condition();
    condition.setCode(json['qname']);
    condition.license = json['label'];
    if (json['params']) {
      condition.params = ConditionParam.fromJson(json['params']);
    }
    return condition;
  }

  setCode(code: string) {
    this.code = code;
    this.name = code;
    if (this.name.indexOf('cz.incad.kramerius.security.impl.criteria.') > -1) {
      this.name = this.name.substring("cz.incad.kramerius.security.impl.criteria.".length);
    }
  }

  copyFrom(condition: Condition) {
    this.code = condition.code;
    this.name = condition.name;
    this.license = condition.license;
    if (condition.params) {
      this.params = new ConditionParam();
      this.params.copyFrom(condition.params);
    }
  }

  toJson() {
    const json: any = {
      qname: this.code,
    }
    if (this.params) {
      json['params'] = this.params.toJson();
    }
    if (this.license) {
      json['label'] = this.license;
    }
    return json;
  }

}