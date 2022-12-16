import { CreateCalendarEventRequest } from 'src/dto/calendar-event/requests/create-calendar-event.request';
import { UpdateCalendarEventRequest } from 'src/dto/calendar-event/requests/update-calendar-event.request';
import { CalendarListResponse } from 'src/dto/calendar-event/responses/calendar-list.response';
import { PycUser } from 'src/dto/common/dto/pyc-user.dto';
import { Calendar } from 'src/entities/calendar-event/calendar.entity';
import { ICalendarEventService } from '../interfaces/calendar-event-service.interface';

export class CalendarService implements ICalendarEventService {
  saveEvent(pycUser: PycUser, req: CreateCalendarEventRequest): Promise<void> {
    throw new Error('Method not implemented.');
  }

  getEventsByMonth(
    pycUser: PycUser,
    monthDate: Date,
    options?: { offset: number; limit: number } | undefined,
  ): Promise<CalendarListResponse> {
    throw new Error('Method not implemented.');
  }

  updateEvent(pycUser: PycUser, targetId: string, req: UpdateCalendarEventRequest): Promise<void> {
    throw new Error('Method not implemented.');
  }
  deleteEvent(pycUser: PycUser, targeteId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
