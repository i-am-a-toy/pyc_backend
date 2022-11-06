import { PycUser } from 'src/dto/common/dto/pyc-user.dto';
import { CreateNoticeRequest } from 'src/dto/notice/requests/create-notice.request';
import { UpdateNoticeRequest } from 'src/dto/notice/requests/update-notice.request';
import { NoticeListResponse } from 'src/dto/notice/responses/notice-list.response';
import { NoticeResponse } from 'src/dto/notice/responses/notice.response';

export interface INoticeService {
  save(user: PycUser, req: CreateNoticeRequest): Promise<void>;
  findAll(churchId: number, offset: number, limit: number): Promise<NoticeListResponse>;
  findOneById(churchId: number, id: number): Promise<NoticeResponse>;
  update(user: PycUser, id: number, req: UpdateNoticeRequest): Promise<void>;
  deleteById(churchId: number, id: number): Promise<void>;
}
