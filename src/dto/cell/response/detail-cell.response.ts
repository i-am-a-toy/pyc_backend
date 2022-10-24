import { UserResponse } from 'src/dto/user/responses/user.response';
import { Cell } from 'src/entities/cell/cell.entity';

export class DetailCellResponse {
  readonly id: number;
  readonly churchId: number;
  readonly familyId: number | null;
  readonly leader: UserResponse;
  readonly name: string;
  readonly members: UserResponse[];

  constructor(cell: Cell) {
    this.id = cell.id;
    this.churchId = cell.churchId;
    this.familyId = cell.familyId;
    this.leader = new UserResponse(cell.leader);
    this.name = cell.name;
    this.members = cell.members ? cell.members.map((m) => new UserResponse(m)) : [];
  }
}
