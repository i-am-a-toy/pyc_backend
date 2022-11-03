import { ClassProvider, Module } from '@nestjs/common';
import { AttendanceEntityModule } from 'src/entities/attendnace/attendance-entity.module';
import { AttendanceController } from './controllers/attendance.controller';
import { AttendanceCountFactoryKey, AttendnaceCountFactory } from './factories/attendance-count.factory';
import { AttendanceService, AttendanceServiceKey } from './services/attendance.service';

export const attendanceCountFactory: ClassProvider = {
  provide: AttendanceCountFactoryKey,
  useClass: AttendnaceCountFactory,
};

export const attendanceService: ClassProvider = {
  provide: AttendanceServiceKey,
  useClass: AttendanceService,
};

@Module({
  imports: [AttendanceEntityModule],
  controllers: [AttendanceController],
  providers: [attendanceCountFactory, attendanceService],
})
export class V1AttendanceModule {}
