import { Body, Controller, Get, Inject, Param, Post, Put } from '@nestjs/common';
import { PycContext } from 'src/core/decorator/pyc-user.decorator';
import { CreateCalendarRequest } from 'src/dto/calendar-event/requests/create-calendar.request';
import { UpdateCalendarRequest } from 'src/dto/calendar-event/requests/update-calendar.request';
import { CalendarListResponse } from 'src/dto/calendar-event/responses/calendar-list.response';
import { PycUser } from 'src/dto/common/dto/pyc-user.dto';
import { ICalendarService } from '../interfaces/calendar-service.interface';
import { CalendarServiceKey } from '../services/calendar.service';

@Controller('/calendars')
export class CalendarController {
  constructor(@Inject(CalendarServiceKey) private readonly service: ICalendarService) {}

  @Get('/month/:month')
  async getMonthCalendar(@PycContext() pycUser: PycUser, @Param('month') month: string): Promise<CalendarListResponse> {
    const thisYear = new Date().getFullYear();
    return this.service.getCalendarsByMonth(pycUser, new Date(`${thisYear}-${month}-01`));
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

  @Put('/:id')
  async delete(@PycContext() pycUser: PycUser, @Param('id') id: number): Promise<void> {
    await this.service.delete(pycUser, id);
  }
}
