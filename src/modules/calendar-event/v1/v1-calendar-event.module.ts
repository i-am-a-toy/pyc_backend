import { Module } from '@nestjs/common';
import { CalendarEventEntityModule } from 'src/entities/calendar-event/calendar-event-entity.module';
import { CalendarEventController } from './controllers/calendar-event.controller';

@Module({
  imports: [CalendarEventEntityModule],
  controllers: [CalendarEventController],
  providers: [],
})
export class V1CalendarEventModule {}
