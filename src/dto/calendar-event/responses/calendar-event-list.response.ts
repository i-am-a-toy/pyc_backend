import { BaseListResponse } from 'src/dto/common/responses/base-list.response';
import { CalendarEvent } from 'src/entities/calendar-event/calendar-event.entity';
import { CalendarEventResponse } from './calendar-event.response';

export class CalendarEventList extends BaseListResponse<CalendarEventResponse> {
  constructor(entiies: CalendarEvent[], count: number) {
    const rows = entiies.map((e) => new CalendarEventResponse(e));
    super(rows, count);
  }
}
