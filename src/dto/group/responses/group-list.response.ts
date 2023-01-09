import { BaseListResponse } from 'src/dto/common/responses/base-list.response';
import { Group } from 'src/entities/group/group.entity';
import { GroupResponse } from './group.response';

export class GroupListResponse extends BaseListResponse<GroupResponse> {
  constructor(entities: Group[], count: number) {
    super(
      entities.map((e) => new GroupResponse(e)),
      count,
    );
  }
}
