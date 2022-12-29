import { BaseListResponse } from 'src/dto/common/responses/base-list.response';
import { Calendar } from 'src/entities/calendar-event/calendar.entity';
import { CalendarResponse } from './calendar.response';

export class CalendarListResponse extends BaseListResponse<CalendarResponse> {
  constructor(entities: Calendar[], count: number) {
    const rows = entities.map((e) => new CalendarResponse(e));
    super(rows, count);
  }
}
