export class TokenClaim {
  readonly id: string;
  readonly churchId: number;
  readonly userId: number;
  readonly name: string;
  readonly roleName: string;

  constructor(id: string, churchId: number, userId: number, name: string, roleName: string) {
    this.id = id;
    this.churchId = churchId;
    this.userId = userId;
    this.name = name;
    this.roleName = roleName;
  }

  toPlain(): { id: string; churchId: number; userId: number; name: string; roleName: string } {
    return {
      id: this.id,
      churchId: this.churchId,
      userId: this.userId,
      name: this.name,
      roleName: this.roleName,
    };
  }
}
