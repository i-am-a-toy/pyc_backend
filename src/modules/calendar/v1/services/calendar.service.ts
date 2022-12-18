import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCalendarRequest } from 'src/dto/calendar-event/requests/create-calendar.request';
import { UpdateCalendarRequest } from 'src/dto/calendar-event/requests/update-calendar.request';
import { CalendarListResponse } from 'src/dto/calendar-event/responses/calendar-list.response';
import { PycUser } from 'src/dto/common/dto/pyc-user.dto';
import { Calendar } from 'src/entities/calendar-event/calendar.entity';
import { Church } from 'src/entities/church/church.entity';
import { User } from 'src/entities/user/user.entity';
import { getMonthFirstDay, getMonthLastDay } from 'src/utils/date';
import { DataSource, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
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
    const [rows, count] = await this.repository.findAndCount({
      where: {
        start: MoreThanOrEqual(getMonthFirstDay(monthDate)),
        end: LessThanOrEqual(getMonthLastDay(monthDate)),
        churchId: churchId,
      },
      order: { start: 'ASC' },
      skip: options?.offset,
      take: options?.limit,
    });

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
      target.uddateCalendar(modifier, start, end, isAllDay, title, content);
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

  async delete(pycUser: PycUser, targeteId: number): Promise<void> {
    await this.repository.delete({ churchId: pycUser.churchId, id: targeteId });
  }
}
