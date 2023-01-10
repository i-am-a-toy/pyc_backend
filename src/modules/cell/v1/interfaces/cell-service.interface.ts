import { CreateCellRequest } from 'src/dto/cell/requests/create-cell.request';
import { UpdateCellRequest } from 'src/dto/cell/requests/update-cell.request';
import { CellListResponse } from 'src/dto/cell/response/cell-list.response';
import { DetailCellResponse } from 'src/dto/cell/response/detail-cell.response';
import { PycUser } from 'src/dto/common/dto/pyc-user.dto';

export interface ICellService {
  // C
  save(pycUser: PycUser, req: CreateCellRequest): Promise<void>;

  // R
  findByGroupId(groupId: number, offset: number, limit: number): Promise<CellListResponse>;
  findOneById(id: number): Promise<DetailCellResponse>;

  // U
  update(churchId: number, id: number, req: UpdateCellRequest): Promise<DetailCellResponse>;

  // D
  delete(churchId: number, id: number): Promise<void>;
}
