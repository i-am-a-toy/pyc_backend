import { UserResponse } from 'src/dto/user/responses/user.response';
import { Group } from 'src/entities/group/group.entity';

export class GroupResponse {
  readonly id: number;
  readonly churchId: number;
  readonly name: string;
  readonly leader: UserResponse | null;

  constructor(e: Group) {
    this.id = e.id;
    this.churchId = e.churchId;
    this.name = e.name;
    this.leader = e.leader ? new UserResponse(e.leader) : null;
  }
}
