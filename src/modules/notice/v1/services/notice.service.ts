import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PycUser } from 'src/dto/common/dto/pyc-user.dto';
import { CreateNoticeRequest } from 'src/dto/notice/requests/create-notice.request';
import { UpdateNoticeRequest } from 'src/dto/notice/requests/update-notice.request';
import { NoticeListResponse } from 'src/dto/notice/responses/notice-list.response';
import { NoticeResponse } from 'src/dto/notice/responses/notice.response';
import { Church } from 'src/entities/church/church.entity';
import { Notice } from 'src/entities/notice/notice.entity';
import { User } from 'src/entities/user/user.entity';
import { DataSource, EntityNotFoundError, Repository, SelectQueryBuilder } from 'typeorm';
import { INoticeService } from '../interfaces/notcie-service.interface';

export const NoticeServiceKey = 'NoticeServiceKey';

export class NoticeService implements INoticeService {
  private readonly logger = new Logger(NoticeService.name);
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Notice) private readonly repository: Repository<Notice>,
  ) {}

  async save(user: PycUser, req: CreateNoticeRequest): Promise<void> {
    const qr = this.dataSource.createQueryRunner();
    await qr.startTransaction();

    try {
      const church = await qr.manager.findOneByOrFail(Church, { id: user.churchId });
      const writer = await qr.manager.findOneByOrFail(User, { churchId: user.churchId, id: user.userId });
      const entity = req.toEntity(church, writer);
      await qr.manager.save(Notice, entity);
      await qr.commitTransaction();
    } catch (e) {
      this.logger.error(`Failed Save Notice Error: ${e.message}`);
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  async findAll(churchId: number, offset: number, limit: number): Promise<NoticeListResponse> {
    const [entities, count] = await this.getDefaultFindQueryBuild(churchId)
      .offset(offset)
      .limit(limit)
      .orderBy('notice.created_at', 'DESC')
      .getManyAndCount();

    return new NoticeListResponse(entities, count);
  }

  async findOneById(churchId: number, id: number): Promise<NoticeResponse> {
    const selected = await this.getDefaultFindQueryBuild(churchId).andWhere('notice.id = :id', { id }).getOne();
    if (!selected) throw new EntityNotFoundError(Notice, { churchId, id });

    return new NoticeResponse(selected);
  }

  async update(user: PycUser, id: number, req: UpdateNoticeRequest): Promise<void> {
    const qr = this.dataSource.createQueryRunner();
    await qr.startTransaction();

    try {
      const target = await qr.manager.findOneByOrFail(Notice, { churchId: user.churchId, id });
      const writer = await qr.manager.findOneByOrFail(User, { churchId: user.churchId, id: user.userId });

      target.updateNotice(req.title, req.content, writer);
      await qr.manager.save(Notice, target);
      await qr.commitTransaction();
    } catch (e) {
      this.logger.error(`Failed Update Notice Error: ${e.message}`);
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  async deleteById(churchId: number, id: number): Promise<void> {
    await this.repository.delete({ churchId, id });
  }

  private getDefaultFindQueryBuild(churchId: number): SelectQueryBuilder<Notice> {
    return this.repository
      .createQueryBuilder('notice')
      .leftJoinAndMapOne('createdUser', User, 'c_user', 'notice.created_by = c_user.id')
      .leftJoinAndMapOne('lastModifiedUser', User, 'm_user', 'notice.last_modified_by = m_user.id')
      .where('notice.church_id = :churchId', { churchId });
  }
}
