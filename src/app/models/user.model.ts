
export class User {

  authenticated: boolean = false;
  uid: string;
  name: string;
  roles: string[];

  static fromJson(json): User {
    if (json) {
      const user = new User();
      user.authenticated = !!json['authenticated'];
      user.name = (json['name'] || '').trim();
      user.uid = json['uid'];
      user.roles = json['roles'] || [];
      return user;
    }
    return null;
  }

  constructor() {
  }

  isLoggedIn(): boolean {
    return this.authenticated;
  }

  /*
  isAdmin(): boolean {
    return this.roles.indexOf('kramerius_admin') >= 0;
  }*/
}
