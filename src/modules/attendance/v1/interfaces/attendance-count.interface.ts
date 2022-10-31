import { AttendanceCountResponse } from 'src/dto/attendance/responses/attendance-count.response';

export interface IAttendanceCountService {
  getAttendance(churchId: number, date: Date, weekly: number): Promise<AttendanceCountResponse>;
}
