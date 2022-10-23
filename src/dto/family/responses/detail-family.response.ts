import { CellResponse } from 'src/dto/cell/response/cell.response';
import { UserResponse } from 'src/dto/user/responses/user.response';
import { Family } from 'src/entities/family/family.entity';

export class DetailFamilyResponse {
  readonly id: number;
  readonly churchId: number;
  readonly name: string;
  readonly leader: UserResponse;
  readonly subLeader: UserResponse | null;
  readonly cells: CellResponse[];

  constructor(family: Family) {
    this.id = family.id;
    this.churchId = family.churchId;
    this.name = family.name;
    this.leader = new UserResponse(family.leader);
    this.subLeader = family.subLeader ? new UserResponse(family.subLeader) : null;
    this.cells = family.cells ? family.cells.map((cell) => new CellResponse(cell)) : [];
  }
}
