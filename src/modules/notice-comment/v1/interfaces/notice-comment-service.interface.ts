import { PycUser } from 'src/dto/common/dto/pyc-user.dto';
import { CreateNoticeCommentRequest } from 'src/dto/notice-comment/requests/create-notice-comment.request';
import { NoticeCommentListResponse } from 'src/dto/notice-comment/responses/notice-comment-list.response';

export interface INoticeCommentSerivce {
  //C
  save(pycUser: PycUser, noticeId: number, req: CreateNoticeCommentRequest): Promise<void>;

  //R
  findAll(pycUser: PycUser, noticeId: number, offset: number, limit: number): Promise<NoticeCommentListResponse>;

  //U
  update(pycUser: PycUser, targetId: number, comment: string): Promise<void>;

  //D
  delete(pycUser: PycUser, targetId: number): Promise<void>;
}
