import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PycUser } from 'src/dto/common/dto/pyc-user.dto';
import { CreateNoticeCommentRequest } from 'src/dto/notice-comment/request/create-notice-comment.request';
import { Church } from 'src/entities/church/church.entity';
import { NoticeComment } from 'src/entities/notice-comment/notice-comment.entity';
import { Notice } from 'src/entities/notice/notice.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { INoticeCommentService } from '../interfaces/notice-comment.interface';

export const NoticeCommentServiceKey = 'NoticeCommentServiceKey';

@Injectable()
export class NoticeCommentSerivce implements INoticeCommentService {
  private readonly logger: Logger = new Logger(NoticeCommentSerivce.name);
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(NoticeComment) private readonly repository: Repository<NoticeComment>,
  ) {}

  async save(pycUser: PycUser, noticeId: number, req: CreateNoticeCommentRequest): Promise<void> {
    const { comment, parentId } = req;
    const qr = this.dataSource.createQueryRunner();
    await qr.startTransaction();

    try {
      const church = await this.dataSource.manager.findOneByOrFail(Church, { id: pycUser.churchId });
      const notice = await this.dataSource.manager.findOneByOrFail(Notice, { id: noticeId });

      parentId
        ? await this.saveChildComment(qr, church, notice, comment, parentId)
        : await this.saveComment(qr, church, notice, comment);
      await qr.commitTransaction();
    } catch (e) {
      this.logger.error(`Failed Save NoticeComment Error: ${e.message}`);
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  async update(pycUser: PycUser, id: number, comment: string): Promise<void> {
    const qr = this.dataSource.createQueryRunner();
    await qr.startTransaction();

    try {
      const target = await qr.manager.findOneByOrFail(NoticeComment, { churchId: pycUser.churchId, id });
      target.changeComment(comment);
      await qr.manager.save(NoticeComment, target);
      await qr.commitTransaction();
    } catch (e) {
      this.logger.error(`Failed Update NoticeComment Error: ${e.message}`);
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  async delete(pycUser: PycUser, id: number): Promise<void> {
    await this.repository.delete({ churchId: pycUser.churchId, id });
  }

  private async saveComment(qr: QueryRunner, church: Church, notice: Notice, comment: string): Promise<void> {
    const e = NoticeComment.of(church, notice, comment);
    await qr.manager.save(e);
  }

  private async saveChildComment(
    qr: QueryRunner,
    church: Church,
    notice: Notice,
    comment: string,
    parentId: number,
  ): Promise<void> {
    const parentComment = await this.dataSource.manager.findOneOrFail(NoticeComment, {
      where: { id: parentId },
      relations: ['children'],
    });
    const e = NoticeComment.of(church, notice, comment, this.getSortNumber(parentComment.children), parentComment);
    await qr.manager.save(e);
  }

  private getSortNumber(noticeComments: NoticeComment[]): number {
    if (!noticeComments.length) return 1;
    return Math.max(...noticeComments.map((e) => e.groupSortNumber!)) + 1;
  }
}
