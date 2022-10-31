import { Injectable } from '@nestjs/common';
import { AttendanceCountResponse } from 'src/dto/attendance/responses/attendance-count.response';
import { IAttendanceCountService } from '../interfaces/attendance-count.interface';

@Injectable()
export class WeekAttendanceCountService implements IAttendanceCountService {
  getAttendance(churchId: number, date: Date, weekly: number): Promise<AttendanceCountResponse> {
    throw new Error('Method not implemented.');
  }
}
