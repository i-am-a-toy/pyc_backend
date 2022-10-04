import { BaseListResponse } from 'src/dto/common/responses/base-list.response';
import { Church } from 'src/entities/church/church.entity';
import { ChurchResponse } from './church.response';

export class ChurchListResponse extends BaseListResponse<ChurchResponse> {
  constructor(entiies: Church[], count: number) {
    const rows = entiies.map((entity) => new ChurchResponse(entity));
    super(rows, count);
  }
}
