export class FamilyResponse {
  readonly churchId: number;
  readonly id: number;
  readonly name: string;

  constructor(churchId: number, id: number, name: string) {
    this.churchId = churchId;
    this.id = id;
    this.name = name;
  }
}
