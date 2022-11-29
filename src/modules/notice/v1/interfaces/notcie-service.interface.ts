import { PycUser } from 'src/dto/common/dto/pyc-user.dto';
import { CreateNoticeRequest } from 'src/dto/notice/requests/create-notice.request';
import { UpdateNoticeRequest } from 'src/dto/notice/requests/update-notice.request';
import { NoticeListResponse } from 'src/dto/notice/responses/notice-list.response';
import { NoticeResponse } from 'src/dto/notice/responses/notice.response';
import { SortType } from 'src/enum/sort-type.enum';

export interface INoticeService {
  // C
  save(user: PycUser, req: CreateNoticeRequest): Promise<void>;
  // R
  findAll(churchId: number, offset: number, limit: number, sort: SortType): Promise<NoticeListResponse>;
  findOneById(churchId: number, id: number): Promise<NoticeResponse>;
  // U
  update(user: PycUser, id: number, req: UpdateNoticeRequest): Promise<void>;
  // D
  deleteById(churchId: number, id: number): Promise<void>;
}
