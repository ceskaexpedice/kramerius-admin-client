
export class User {

  id: number;
  name: string;
  roles: string[];

  static fromJson(json): User {
    if (json) {
      const id = json['id'];
      const user = new User(id);
      user.name = json['lname'];
      user.roles = [];
      if (json['roles']) {
        for (const role of json['roles']) {
          user.roles.push(role.name);
        }
      }
      return user;
    }
    return null;
  }

  constructor(id: number) {
    this.id = id;
  }

  isLoggedIn(): boolean {
    return this.id > -1;
  }

  isAdmin(): boolean {
    return this.roles.indexOf('kramerius_admin') >= 0;
  }
}
