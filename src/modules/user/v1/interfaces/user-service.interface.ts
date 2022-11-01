import { ValidateResponse } from 'src/dto/common/responses/validate.response';
import { CreateUserRequest } from 'src/dto/user/requests/create-user.request';
import { UpdateUserRequest } from 'src/dto/user/requests/update-user.request';
import { UserListResponse } from 'src/dto/user/responses/user-list.response';
import { UserResponse } from 'src/dto/user/responses/user.response';
import { LEADER_TYPE } from 'src/enum/leader-type.enum';
import { Rank } from 'src/types/rank/rank.type';
import { Role } from 'src/types/role/role.type';

export interface IUserService {
  //C
  save(churchId: number, req: CreateUserRequest): Promise<UserResponse>;

  //R
  findUserById(id: number, churchId: number): Promise<UserResponse>;
  findUsersByRole(churchId: number, role: Role, offset: number, limit: number): Promise<UserListResponse>;
  findUsersByRank(churchId: number, rank: Rank, offset: number, limit: number): Promise<UserListResponse>;
  findUsersWithoutCell(churchId: number, offset: number, limit: number): Promise<UserListResponse>;
  resultByName(churchId: number, name: string): Promise<ValidateResponse>;
  findUserTobeLeader(churchId: number, type: LEADER_TYPE, familyId: number | null): Promise<UserListResponse>;

  //U
  updateCell(churchId: number, prevCellId: number, targetCellId: number, id: number): Promise<void>;
  updateInfo(churchId: number, id: number, req: UpdateUserRequest): Promise<UserResponse>;

  // D
  deleteById(churchId: number, id: number): Promise<void>;
}
