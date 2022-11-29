import { ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PycUser } from 'src/dto/common/dto/pyc-user.dto';
import { CreateNoticeCommentRequest } from 'src/dto/notice-comment/requests/create-notice-comment.request';
import { NoticeCommentListResponse } from 'src/dto/notice-comment/responses/notice-comment-list.response';
import { Church } from 'src/entities/church/church.entity';
import { NoticeComment } from 'src/entities/notice-comment/notice-comment.entity';
import { Notice } from 'src/entities/notice/notice.entity';
import { User } from 'src/entities/user/user.entity';
import { DataSource, Repository } from 'typeorm';
import { INoticeCommentSerivce } from '../interfaces/notice-comment-service.interface';

export const NoticeCommentServiceKey = 'NoticeCommentServiceKey';

export class NoticeCommentService implements INoticeCommentSerivce {
  private readonly logger: Logger = new Logger(NoticeCommentService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(NoticeComment) private readonly repository: Repository<NoticeComment>,
  ) {}

  async save(pycUser: PycUser, noticeId: number, req: CreateNoticeCommentRequest): Promise<void> {
    const qr = this.dataSource.createQueryRunner();
    await qr.startTransaction();

    try {
      const church = await qr.manager.findOneByOrFail(Church, { id: pycUser.churchId });
      const notice = await qr.manager.findOneByOrFail(Notice, { churchId: pycUser.churchId, id: noticeId });
      const writer = await qr.manager.findOneByOrFail(User, { churchId: pycUser.churchId, id: pycUser.userId });
      await qr.manager.save(NoticeComment, NoticeComment.of(church, notice, writer, req.comment));
      await qr.commitTransaction();
    } catch (e) {
      this.logger.error(`Failed Save NoticeComment Error: ${e.message}`);
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  async findAll(pycUser: PycUser, noticeId: number, offset: number, limit: number): Promise<NoticeCommentListResponse> {
    const { churchId } = pycUser;

    const [rows, count] = await this.repository
      .createQueryBuilder('comment')
      .leftJoinAndMapOne('comment.cUser', User, 'c_user', 'comment.created_by = c_user.id')
      .where('comment.church_id = :churchId', { churchId })
      .andWhere('comment.notice_id = :noticeId', { noticeId })
      .orderBy('comment.created_at', 'DESC')
      .offset(offset)
      .limit(limit)
      .getManyAndCount();
    return new NoticeCommentListResponse(rows, count);
  }

  async update(pycUser: PycUser, targetId: number, comment: string): Promise<void> {
    const { churchId, userId } = pycUser;
    const qr = this.dataSource.createQueryRunner();
    await qr.startTransaction();

    try {
      //find target & modifiet
      const target = await qr.manager.findOneByOrFail(NoticeComment, { churchId, id: targetId });
      const modifier = await qr.manager.findOneByOrFail(User, { churchId, id: userId });

      //validate is equal writer & modifier
      if (target.createdBy !== modifier.id) throw new ForbiddenException('작성자만 수정 할 수 있습니다.');

      //update & commit
      target.updateCommeht(comment);
      await qr.manager.save(target);
      await qr.commitTransaction();
    } catch (e) {
      this.logger.error(`Failed Update NoticeComment Error: ${e.message}`);
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  async delete(pycUser: PycUser, targetId: number): Promise<void> {
    const { churchId, userId } = pycUser;
    const qr = this.dataSource.createQueryRunner();
    await qr.startTransaction();

    try {
      //find target & modifiet
      const target = await qr.manager.findOneByOrFail(NoticeComment, { churchId, id: targetId });

      //validate is equal writer & deleter
      if (target.createdBy !== userId) throw new ForbiddenException('작성자만 삭제 할 수 있습니다.');

      //delete & commit
      await qr.manager.remove(target);
      await qr.commitTransaction();
    } catch (e) {
      this.logger.error(`Failed Delete NoticeComment Error: ${e.message}`);
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }
}
