import { BaseListResponse } from 'src/dto/common/responses/base-list.response';
import { NoticeComment } from 'src/entities/notice-comment/notice-comment.entity';
import { NoticeCommentResponse } from './notice-comment.response';

export class NoticeCommentListResponse extends BaseListResponse<NoticeCommentResponse> {
  constructor(entities: NoticeComment[], count: number) {
    const rows = entities.map((e) => new NoticeCommentResponse(e));
    super(rows, count);
  }
}
