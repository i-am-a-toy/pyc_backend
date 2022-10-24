import { BaseListResponse } from 'src/dto/common/responses/base-list.response';
import { User } from 'src/entities/user/user.entity';
import { UserResponse } from './user.response';

export class UserListResponse extends BaseListResponse<UserResponse> {
  constructor(entiies: User[], count: number) {
    const rows = entiies.map((entity) => new UserResponse(entity));
    super(rows, count);
  }
}
