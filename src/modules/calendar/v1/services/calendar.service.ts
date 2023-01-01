import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCalendarRequest } from 'src/dto/calendar/requests/create-calendar.request';
import { UpdateCalendarRequest } from 'src/dto/calendar/requests/update-calendar.request';
import { CalendarListResponse } from 'src/dto/calendar/responses/calendar-list.response';
import { PycUser } from 'src/dto/common/dto/pyc-user.dto';
import { Calendar } from 'src/entities/calendar-event/calendar.entity';
import { Church } from 'src/entities/church/church.entity';
import { User } from 'src/entities/user/user.entity';
import { getMonthFirstDay, getMonthLastDay, getMonthString, getPrevMonthLastDay } from 'src/utils/date';
import { DataSource, Repository } from 'typeorm';
import { ICalendarService } from '../interfaces/calendar-service.interface';

export const CalendarServiceKey = 'CalendarServiceKey';

export class CalendarService implements ICalendarService {
  private readonly logger: Logger = new Logger(CalendarService.name);
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Calendar) private readonly repository: Repository<Calendar>,
  ) {}

  async save(pycUser: PycUser, req: CreateCalendarRequest): Promise<void> {
    const qr = this.dataSource.createQueryRunner();
    await qr.startTransaction();
    try {
      const { churchId, userId } = pycUser;
      // find church & creator
      const church = await qr.manager.findOneByOrFail(Church, { id: churchId });
      const creator = await qr.manager.findOneByOrFail(User, { id: userId });

      // create entity & save
      await qr.manager.save(Calendar, req.toEntity(church, creator));
      await qr.commitTransaction();
    } catch (e) {
      this.logger.error(`Failed Create Calendar Error: ${e.message}`);
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  async getCalendarsByMonth(
    pycUser: PycUser,
    monthDate: Date,
    options?: { offset: number; limit: number } | undefined,
  ): Promise<CalendarListResponse> {
    const { churchId } = pycUser;
    const first = getPrevMonthLastDay(monthDate);
    const last = getMonthLastDay(monthDate);

    const [rows, count] = await this.repository
      .createQueryBuilder('calendar')
      .leftJoinAndMapOne('calendar.cUser', User, 'c_user', 'calendar.created_by = c_user.id')
      .leftJoinAndMapOne('calendar.mUser', User, 'm_user', 'calendar.last_modified_by = m_user.id')
      .where(
        `"calendar"."church_id" = :churchId
        AND (
          ("calendar"."start" >= :first AND "calendar"."end" <= :last) OR -- 월 안에 있는
          ("calendar"."start" <= :first AND :last <= "calendar"."end") OR -- start end 둘다 월 밖에 있을 경우
          ("calendar"."start" <= :first AND ("calendar"."end" >= :first AND "calendar"."end" <= :last)) OR -- start는 월 밖에 end는 월 안에
          (("calendar"."start" >= :first AND "calendar"."start" <= :last) AND :last <= "calendar"."end") -- start는 월 안에 end는 월 밖에
        )`,
        { churchId, first, last },
      )
      .orderBy('calendar.start', 'ASC')
      .offset(options?.offset)
      .limit(options?.limit)
      .getManyAndCount();

    return new CalendarListResponse(rows, count);
  }

  async update(pycUser: PycUser, targetId: number, req: UpdateCalendarRequest): Promise<void> {
    const qr = this.dataSource.createQueryRunner();
    await qr.startTransaction();

    try {
      const { churchId, userId } = pycUser;
      //find target with churchId, id
      const modifier = await qr.manager.findOneByOrFail(User, { churchId, id: userId });
      const target = await qr.manager.findOneByOrFail(Calendar, { churchId: modifier.churchId, id: targetId });

      //update & Save
      const { start, end, isAllDay, title, content } = req;
      target.updateCalendar(modifier, start, end, isAllDay, title, content);
      await qr.manager.save(target);
      await qr.commitTransaction();
    } catch (e) {
      this.logger.error(`Failed Update Calendar Error: ${e.message}`);
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  async delete(pycUser: PycUser, targetId: number): Promise<void> {
    await this.repository.delete({ churchId: pycUser.churchId, id: targetId });
  }
}
