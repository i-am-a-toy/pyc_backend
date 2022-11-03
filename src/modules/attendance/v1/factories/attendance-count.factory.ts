import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IFactories } from 'src/common/interfaces/factories.interface';
import { Attendance } from 'src/entities/attendnace/attendance.entity';
import { AttendanceFilter } from 'src/enum/attendance-filter-type.enum';
import { Repository } from 'typeorm';
import { IAttendanceCountService } from '../interfaces/attendance-count.interface';
import { MonthAttendanceCountService } from '../services/month-attendance-count.service';
import { WeekAttendanceCountService } from '../services/week-attendance-count.service';
import { YearAttendanceCountService } from '../services/year-attendance-count.service';

export const AttendanceCountFactoryKey = 'AttendanceCountFactory';

@Injectable()
export class AttendnaceCountFactory implements IFactories<AttendanceFilter, IAttendanceCountService> {
  constructor(@InjectRepository(Attendance) private readonly repository: Repository<Attendance>) {}

  getInstance(t: AttendanceFilter): IAttendanceCountService {
    if (t === AttendanceFilter.YEAR) {
      return new YearAttendanceCountService(this.repository);
    } else if (t === AttendanceFilter.MONTH) {
      return new MonthAttendanceCountService(this.repository);
    } else {
      return new WeekAttendanceCountService(this.repository);
    }
  }
}
