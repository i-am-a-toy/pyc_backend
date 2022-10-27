import { Role } from 'src/types/role/role.type';

export class PycUser {
  constructor(
    readonly id: string,
    readonly churchId: number,
    readonly userId: number,
    readonly name: string,
    readonly role: Role,
  ) {}
}
