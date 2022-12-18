import { BaseListResponse } from 'src/dto/common/responses/base-list.response';
import { Calendar } from 'src/entities/calendar-event/calendar.entity';
import { CalendarResponse } from './calendar.response';

export class CalendarListResponse extends BaseListResponse<CalendarResponse> {
  constructor(entiies: Calendar[], count: number) {
    const rows = entiies.map((e) => new CalendarResponse(e));
    super(rows, count);
  }
}
