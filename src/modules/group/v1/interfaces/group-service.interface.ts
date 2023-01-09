import { PycUser } from 'src/dto/common/dto/pyc-user.dto';
import { CreateGroupRequest } from 'src/dto/group/requests/create-group.request';
import { UpdateGroupLeaderRequest } from 'src/dto/group/requests/update-group-leader.request';
import { UpdateGroupNameRequest } from 'src/dto/group/requests/update-group-name.request';
import { GroupListResponse } from 'src/dto/group/responses/group-list.response';
import { GroupResponse } from 'src/dto/group/responses/group.response';

export interface IGroupService {
  //C
  save(pycUser: PycUser, req: CreateGroupRequest): Promise<void>;

  //R
  findAll(pycUser: PycUser, offset: number, limit: number): Promise<GroupListResponse>;
  findById(id: number): Promise<GroupResponse>;

  // U
  updateName(pycUser: PycUser, id: number, req: UpdateGroupNameRequest): Promise<void>;
  updateLeader(pycUser: PycUser, id: number, req: UpdateGroupLeaderRequest): Promise<void>;

  //D
  deleteById(id: number): Promise<void>;
}
