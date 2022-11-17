import { PycUser } from 'src/dto/common/dto/pyc-user.dto';
import { CreateNoticeCommentRequest } from 'src/dto/notice-comment/request/create-notice-comment.request';

export interface INoticeCommentService {
  save(pycUser: PycUser, noticeId: number, req: CreateNoticeCommentRequest): Promise<void>;
  update(pycUser: PycUser, id: number, comment: string): Promise<void>;
  delete(pycUser: PycUser, id: number): Promise<void>;
}
