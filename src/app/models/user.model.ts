
export class User {

  authenticated: boolean = false;
  uid: string;
  name: string;
  roles: string[];
  licenses: string[];
  session: any;

  static fromJson(json: any): User {
    if (json) {
      const user = new User();
      user.authenticated = !!json['authenticated'];
      user.name = (json['name'] || '').trim();
      user.uid = json['uid'];
      user.roles = json['roles'] || [];
      user.session = json['session'] || {};
      user.licenses = json['licenses'] || [];
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
