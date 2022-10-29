import { Module } from '@nestjs/common';
import { AttendanceEntityModule } from 'src/entities/attendnace/attendance-entity.module';
import { AttendanceController } from './controllers/attendance.controller';

@Module({
  imports: [AttendanceEntityModule],
  controllers: [AttendanceController],
})
export class V1AttendanceModule {}
