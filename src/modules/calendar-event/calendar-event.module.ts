import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { V1CalendarEventModule } from './v1/v1-calendar-event.module';

@Module({
  imports: [
    V1CalendarEventModule,
    RouterModule.register([
      {
        path: '/api/v1',
        module: V1CalendarEventModule,
      },
    ]),
  ],
})
export class CalendarEventModule {}
