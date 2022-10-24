import { BaseListResponse } from 'src/dto/common/responses/base-list.response';
import { Cell } from 'src/entities/cell/cell.entity';
import { CellResponse } from './cell.response';

export class CellListResponse extends BaseListResponse<CellResponse> {
  constructor(cells: Cell[], count: number) {
    super(
      cells.map((c) => new CellResponse(c)),
      count,
    );
  }
}
