import { BaseListResponse } from 'src/dto/common/responses/base-list.response';
import { Family } from 'src/entities/family/family.entity';
import { FamilyResponse } from './family.response';

export class FamilyListResponse extends BaseListResponse<FamilyResponse> {
  constructor(families: Family[], count: number) {
    super(
      families.map((family) => new FamilyResponse(family.id, family.churchId, family.name)),
      count,
    );
  }
}
