import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Calendar } from './calendar.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Calendar])],
  exports: [TypeOrmModule],
})
export class CalendarEntityModule {}
