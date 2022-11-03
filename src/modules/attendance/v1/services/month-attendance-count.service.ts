import { Injectable } from '@nestjs/common';
import { AttendanceCountResponse } from 'src/dto/attendance/responses/attendance-count.response';
import { Attendance } from 'src/entities/attendnace/attendance.entity';
import { getMonthFirstDay, getMonthLastDay } from 'src/utils/date';
import { Repository } from 'typeorm';
import { IAttendanceCountService } from '../interfaces/attendance-count.interface';

@Injectable()
export class MonthAttendanceCountService implements IAttendanceCountService {
  constructor(private readonly repository: Repository<Attendance>) {}

  async getAttendance(churchId: number, date: Date): Promise<AttendanceCountResponse> {
    const startDate = getMonthFirstDay(date);
    const endDate = getMonthLastDay(date);

    const [result]: { worthship: string | null; group: string | null }[] = await this.repository
      .createQueryBuilder()
      .select('SUM(CARDINALITY(worthship_attendance)) as worthship')
      .addSelect('SUM(CARDINALITY(group_attendance)) as group')
      .andWhere('church_id = :churchId', { churchId })
      .andWhere('attendance_date >= :startDate', { startDate })
      .andWhere('attendance_date <= :endDate', { endDate })
      .execute();

    return new AttendanceCountResponse(result.worthship ? +result.worthship : 0, result.group ? +result.group : 0);
  }
}
