import { ClassProvider, Module } from '@nestjs/common';
import { CalendarEntityModule } from 'src/entities/calendar-event/calendar-event-entity.module';
import { CalendarController } from './controllers/calendar.controller';
import { CalendarService, CalendarServiceKey } from './services/calendar.service';

const calendarService: ClassProvider = {
  provide: CalendarServiceKey,
  useClass: CalendarService,
};

@Module({
  imports: [CalendarEntityModule],
  controllers: [CalendarController],
  providers: [calendarService],
})
export class V1CalendarModule {}
