import { CreateChurchRequest } from 'src/dto/church/requests/create-church.request';
import { UpdateChurchRequest } from 'src/dto/church/requests/update-church-request';
import { ChurchListResponse } from 'src/dto/church/responses/church-list.response';
import { ChurchResponse } from 'src/dto/church/responses/church.response';
import { ValidateResponse } from 'src/dto/common/responses/validate.response';

export interface IChurchService {
  // C
  save(req: CreateChurchRequest): Promise<ChurchResponse>;
  // R
  findOneById(id: number): Promise<ChurchResponse>;
  findAll(limit: number, offset: number): Promise<ChurchListResponse>;
  isExsitName(name: string): Promise<ValidateResponse>;
  // U
  update(id: number, req: UpdateChurchRequest): Promise<void>;
  // D
  delete(id: number): Promise<void>;
}
