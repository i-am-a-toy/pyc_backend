import { CreatorDto } from 'src/dto/common/dto/creator.dto';
import { LastModifierDto } from 'src/dto/common/dto/last-modifier.dto';
import { Calendar } from 'src/entities/calendar-event/calendar.entity';

export class CalendarResponse {
  readonly churchId: number;
  readonly title: string;
  readonly content: string;
  readonly start: Date;
  readonly end: Date;
  readonly isAllDay: boolean;
  readonly creator: CreatorDto;
  readonly createdAt: Date;
  readonly lastModifiedName: string;
  readonly lastModifier: LastModifierDto;

  constructor(e: Calendar) {
    this.churchId = e.churchId;
    this.title = e.title;
    this.content = e.content ?? '';
    this.start = e.start;
    this.end = e.end;
    this.isAllDay = e.isAllDay;
    this.creator = new CreatorDto(e.cUser, e.creator);
    this.createdAt = e.createdAt;
    this.lastModifier = new LastModifierDto(e.mUser, e.lastModifier);
  }
}
