import { CreateCalendarEventRequest } from 'src/dto/calendar-event/requests/create-calendar-event.request';
import { UpdateCalendarEventRequest } from 'src/dto/calendar-event/requests/update-calendar-event.request';
import { CalendarListResponse } from 'src/dto/calendar-event/responses/calendar-list.response';
import { PycUser } from 'src/dto/common/dto/pyc-user.dto';

export interface ICalendarEventService {
  //C
  saveEvent(pycUser: PycUser, req: CreateCalendarEventRequest): Promise<void>;
  //R
  getEventsByMonth(
    pycUser: PycUser,
    monthDate: Date,
    options?: { offset: number; limit: number },
  ): Promise<CalendarListResponse>;
  //U
  updateEvent(pycUser: PycUser, targetId: string, req: UpdateCalendarEventRequest): Promise<void>;
  //D
  deleteEvent(pycUser: PycUser, targeteId: string): Promise<void>;
}
