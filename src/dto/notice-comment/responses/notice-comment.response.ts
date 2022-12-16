import { CreatorDto } from 'src/dto/common/dto/creator.dto';
import { NoticeComment } from 'src/entities/notice-comment/notice-comment.entity';

export class NoticeCommentResponse {
  readonly id: number;
  readonly churchId: number;
  readonly noticeId: number;
  readonly comment: string;
  readonly creator: CreatorDto;
  readonly createdAt: Date;
  readonly createdBy: number;
  readonly lastModifiedAt: Date;

  constructor(e: NoticeComment) {
    const { id, churchId, noticeId, comment, creator, cUser, createdBy, createdAt } = e;
    this.id = id;
    this.churchId = churchId;
    this.noticeId = noticeId;
    this.comment = comment;
    this.creator = new CreatorDto(cUser, creator);
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.lastModifiedAt = e.lastModifiedAt;
  }
}
