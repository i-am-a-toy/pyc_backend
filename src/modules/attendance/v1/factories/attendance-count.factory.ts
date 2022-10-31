import { Injectable } from '@nestjs/common';
import { IFactories } from 'src/common/interfaces/factories.interface';
import { AttendanceFilter } from 'src/enum/attendance-filter-type.enum';
import { IAttendanceCountService } from '../interfaces/attendance-count.interface';
import { MonthAttendanceCountService } from '../services/month-attendance-count.service';
import { WeekAttendanceCountService } from '../services/week-attendance-count.service';
import { YearAttendanceCountService } from '../services/year-attendance-count.service';

export const AttendanceCountFactoryKey = 'AttendanceCountFactory';

@Injectable()
export class AttendnaceCountFactory implements IFactories<AttendanceFilter, IAttendanceCountService> {
  getInstance(t: AttendanceFilter): IAttendanceCountService {
    if (t === AttendanceFilter.YEAR) {
      return new YearAttendanceCountService();
    } else if (t === AttendanceFilter.MONTH) {
      return new MonthAttendanceCountService();
    } else {
      return new WeekAttendanceCountService();
    }
  }
}
