
export class Role {

  id: number;
  name: string;

  constructor() {
    this.id = 0;
  }

  static fromJson(json: any): Role {
    const role = new Role();
    role.id = json['id'];
    role.name = json['name'];
    return role;
  }

  static fromJsonArray(json: any): Role[] {
    const result = [];
    for (const obj of json) {
      result.push(Role.fromJson(obj));
    }
    return result;
  }

  copyFrom(role: Role) {
    this.id = role.id;
    this.name = role.name;
  }

  toJson() {
    return {
      name: this.name
    }
  }


}
