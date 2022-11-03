import { Injectable } from '@nestjs/common';
import { AttendanceCountResponse } from 'src/dto/attendance/responses/attendance-count.response';
import { Attendance } from 'src/entities/attendnace/attendance.entity';
import { Repository } from 'typeorm';
import { IAttendanceCountService } from '../interfaces/attendance-count.interface';

@Injectable()
export class WeekAttendanceCountService implements IAttendanceCountService {
  constructor(private readonly repository: Repository<Attendance>) {}

  async getAttendance(churchId: number, date: Date, weekly: number): Promise<AttendanceCountResponse> {
    const [result]: { worthship: string | null; group: string | null }[] = await this.repository
      .createQueryBuilder()
      .select('SUM(CARDINALITY(worthship_attendance)) as worthship')
      .addSelect('SUM(CARDINALITY(group_attendance)) as group')
      .andWhere('church_id = :churchId', { churchId })
      .andWhere('attendance_date = :date', { date: date })
      .andWhere('attendance_weekly = :weekly', { weekly })
      .execute();

    return new AttendanceCountResponse(result.worthship ? +result.worthship : 0, result.group ? +result.group : 0);
  }
}
