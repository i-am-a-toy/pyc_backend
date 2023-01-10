import { UserResponse } from 'src/dto/user/responses/user.response';
import { Cell } from 'src/entities/cell/cell.entity';

export class DetailCellResponse {
  readonly id: number;
  readonly churchId: number;
  readonly groupId: number | null;
  readonly leader: UserResponse;
  readonly name: string;

  constructor(cell: Cell) {
    this.id = cell.id;
    this.churchId = cell.churchId;
    this.groupId = cell.groupId;
    this.leader = new UserResponse(cell.leader);
    this.name = cell.name;
  }
}
