import { ValidateExistResponse } from 'src/dto/common/responses/validate-exist.response';
import { CreateFamilyRequest } from 'src/dto/family/requests/create-family.request';
import { UpdateFamilyRequest } from 'src/dto/family/requests/update-family.request';
import { DetailFamilyResponse } from 'src/dto/family/responses/detail-family.response';
import { FamilyListResponse } from 'src/dto/family/responses/family-list.response';

export interface IFamilyService {
  //C
  save(req: CreateFamilyRequest): Promise<DetailFamilyResponse>;

  //R
  findAll(churchId: number, offset: number, limit: number): Promise<FamilyListResponse>;
  findById(churchId: number, id: number): Promise<DetailFamilyResponse>;
  isUsedName(churchId: number, name: string): Promise<ValidateExistResponse>;

  // U
  update(churchId: number, id: number, req: UpdateFamilyRequest): Promise<DetailFamilyResponse>;

  //D
  deleteById(churchId: number, id: number): Promise<void>;
}
