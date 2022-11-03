import { Injectable } from '@nestjs/common';
import { AttendanceCountResponse } from 'src/dto/attendance/responses/attendance-count.response';
import { Attendance } from 'src/entities/attendnace/attendance.entity';
import { Repository } from 'typeorm';
import { IAttendanceCountService } from '../interfaces/attendance-count.interface';

@Injectable()
export class MonthAttendanceCountService implements IAttendanceCountService {
  constructor(private readonly repository: Repository<Attendance>) {}

  async getAttendance(churchId: number, date: Date): Promise<AttendanceCountResponse> {
    const [result]: { worthship: string | null; group: string | null }[] = await this.repository
      .createQueryBuilder()
      .select('SUM(CARDINALITY(worthship_attendance)) as worthship')
      .addSelect('SUM(CARDINALITY(group_attendance)) as group')
      .andWhere('church_id = :churchId', { churchId })
      .andWhere('attendance_date = :date', { date })
      .execute();
    throw new Error('Method not implemented.');
  }

  // private getMonthDate(requestDate: Date): Date[] {}
}
