import { CreateCalendarRequest } from 'src/dto/calendar/requests/create-calendar.request';
import { UpdateCalendarRequest } from 'src/dto/calendar/requests/update-calendar.request';
import { CalendarListResponse } from 'src/dto/calendar/responses/calendar-list.response';
import { PycUser } from 'src/dto/common/dto/pyc-user.dto';

export interface ICalendarService {
  //C
  save(pycUser: PycUser, req: CreateCalendarRequest): Promise<void>;
  //R
  getCalendarsByMonth(
    pycUser: PycUser,
    monthDate: Date,
    options?: { offset?: number; limit?: number },
  ): Promise<CalendarListResponse>;
  //U
  update(pycUser: PycUser, targetId: number, req: UpdateCalendarRequest): Promise<void>;
  //D
  delete(pycUser: PycUser, targeteId: number): Promise<void>;
}
