import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { V1CalendarModule } from './v1/v1-calendar-event.module';

@Module({
  imports: [
    V1CalendarModule,
    RouterModule.register([
      {
        path: '/api/v1',
        module: V1CalendarModule,
      },
    ]),
  ],
})
export class CalendarModule {}
