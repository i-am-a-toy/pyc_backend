import { plainToInstance } from 'class-transformer';
import { Church } from 'src/entities/church/church.entity';
import { NoticeComment } from 'src/entities/notice-comment/notice-comment.entity';
import { Notice } from 'src/entities/notice/notice.entity';

export const getNoticeComment = (
  church: Church,
  notice: Notice,
  comment: string,
  groupSortNumber?: number,
  parent?: NoticeComment,
): NoticeComment => {
  return plainToInstance(NoticeComment, {
    church,
    notice,
    comment,
    groupSortNumber,
    parent,
  });
};
