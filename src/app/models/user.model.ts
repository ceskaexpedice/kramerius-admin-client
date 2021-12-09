
export class User {

  public email: string;
  public name: string;
  public roles: string[];
  public image: string;

  constructor() {
    this.roles = [];
  }

  isAdmin() {
    return this.roles.indexOf('kramerius_admin') >= 0;
  }

}
