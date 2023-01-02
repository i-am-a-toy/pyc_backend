import { ValidateResponse } from 'src/dto/common/responses/validate.response';
import { CreateFamilyRequest } from 'src/dto/family/requests/create-family.request';
import { UpdateFamilyRequest } from 'src/dto/family/requests/update-family.request';
import { GroupListResponse } from 'src/dto/family/responses/group-list.response';
import { GroupResponse } from 'src/dto/family/responses/group.response';

export interface IGroupService {
  //C
  save(churchId: number, userId: number, req: CreateFamilyRequest): Promise<void>;

  //R
  findAll(churchId: number, offset: number, limit: number): Promise<GroupListResponse>;
  findById(churchId: number, id: number): Promise<GroupResponse>;
  isUsedName(churchId: number, name: string): Promise<ValidateResponse>;

  // U
  update(churchId: number, id: number, req: UpdateFamilyRequest): Promise<void>;

  //D
  deleteById(churchId: number, id: number): Promise<void>;
}
