import { Body, Controller, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { Delete } from '@nestjs/common/decorators';
import { PycContext } from 'src/core/decorator/pyc-user.decorator';
import { CalendarListQuery } from 'src/dto/calendar/requests/calendar-list.query';
import { CreateCalendarRequest } from 'src/dto/calendar/requests/create-calendar.request';
import { UpdateCalendarRequest } from 'src/dto/calendar/requests/update-calendar.request';
import { CalendarListResponse } from 'src/dto/calendar/responses/calendar-list.response';
import { PycUser } from 'src/dto/common/dto/pyc-user.dto';
import { ICalendarService } from '../interfaces/calendar-service.interface';
import { CalendarServiceKey } from '../services/calendar.service';

@Controller('/calendars')
export class CalendarController {
  constructor(@Inject(CalendarServiceKey) private readonly service: ICalendarService) {}

  @Get()
  async getMonthCalendar(
    @PycContext() pycUser: PycUser,
    @Query() query: CalendarListQuery,
  ): Promise<CalendarListResponse> {
    const { year, month, offset, limit } = query;
    return this.service.getCalendarsByMonth(pycUser, new Date(`${year}-${month}`), { offset, limit });
  }

  @Post()
  async register(@PycContext() pycUser: PycUser, @Body() req: CreateCalendarRequest): Promise<void> {
    await this.service.save(pycUser, req);
  }

  @Put('/:id')
  async update(
    @PycContext() pycUser: PycUser,
    @Param('id') id: number,
    @Body() req: UpdateCalendarRequest,
  ): Promise<void> {
    await this.service.update(pycUser, id, req);
  }

  @Delete('/:id')
  async delete(@PycContext() pycUser: PycUser, @Param('id') id: number): Promise<void> {
    await this.service.delete(pycUser, id);
  }
}
