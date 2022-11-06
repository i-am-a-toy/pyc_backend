import { BaseListResponse } from 'src/dto/common/responses/base-list.response';
import { Notice } from 'src/entities/notice/notice.entity';
import { NoticeResponse } from './notice.response';

export class NoticeListResponse extends BaseListResponse<NoticeResponse> {
  constructor(entities: Notice[], count: number) {
    const rows = entities.map((e) => new NoticeResponse(e));
    super(rows, count);
  }
}
