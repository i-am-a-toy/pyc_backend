import { Module } from '@nestjs/common';
import { CalendarEntityModule } from 'src/entities/calendar-event/calendar-event-entity.module';
import { CalendarController } from './controllers/calendar-event.controller';

@Module({
  imports: [CalendarEntityModule],
  controllers: [CalendarController],
  providers: [],
})
export class V1CalendarModule {}
