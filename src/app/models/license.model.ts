
export class License {

  id: number;
  name: string;
  description: string;
  priority: number;

  constructor() {
    this.id = 0;
    this.priority = 0;
  }

  static fromJson(json): License {
    const license = new License();
    license.id = json['id'];
    license.name = json['name'];
    license.description = json['description'] || '';
    license.priority = json['priority'];
    return license;
  }

  static fromJsonArray(json): License[] {
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
  }

  toJson() {
    return {
      name: this.name,
      description: this.description || ''
    }
  }


}
