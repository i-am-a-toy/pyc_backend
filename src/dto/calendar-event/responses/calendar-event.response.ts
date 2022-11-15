import { CalendarEvent } from 'src/entities/calendar-event/calendar-event.entity';

export class CalendarEventResponse {
  readonly churchId: number;
  readonly title: string;
  readonly content: string;
  readonly start: Date;
  readonly end: Date;
  readonly isAllDay: boolean;
  readonly createdName: string;
  readonly createdRole: string;
  readonly lastModifiedName: string;
  readonly lastModifiedRole: string;

  constructor(e: CalendarEvent) {
    this.churchId = e.churchId;
    this.title = e.title;
    this.content = e.content ?? '';
    this.start = e.start;
    this.end = e.end;
    this.isAllDay = e.isAllDay;
    this.createdName = e.created.name;
    this.createdRole = e.created.role.name;
    this.lastModifiedName = e.lastModified.name;
    this.lastModifiedRole = e.lastModified.role.name;
  }
}
