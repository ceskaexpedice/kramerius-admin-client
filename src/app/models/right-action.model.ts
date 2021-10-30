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

}

