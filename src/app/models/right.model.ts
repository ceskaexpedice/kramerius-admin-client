import { ConditionParam } from "./condition-param.model";
import { Role } from "./roles.model";

export class Right {
  id: number;
  pid: string;
  role: Role;
  condition: Condition;
  action: string;

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
    }
  }

  static fromJson(json): Right {
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

  static fromJsonArray(json): Right[] {
    const result = [];
    for (const obj of json) {
      result.push(Right.fromJson(obj));
    }
    return result;
  }

  toJson() {
    return {
      action: this.action,
      criterium: this.condition ? this.condition.toJson() : null,
      role: this.role ? this.role.toJson() : null,
      id: this.id,
      pid: this.pid || ""
    }
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

  static fromJson(json): Condition {
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
    return {
      label: this.license,
      qname: this.code,
      params: this.params ? this.params.toJson() : null
    }
  }

}