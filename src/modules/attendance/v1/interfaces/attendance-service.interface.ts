import { AttendanceRequest } from 'src/dto/attendance/requests/attendance.request';
import { AttendanceCountResponse } from 'src/dto/attendance/responses/attendance-count.response';
import { AttendanceResponse } from 'src/dto/attendance/responses/attendance.response';
import { AttendanceFilter } from 'src/enum/attendance-filter-type.enum';

export interface IAttendanceService {
  attend(req: AttendanceRequest): Promise<void>;
  findOneByCellAndDate(churchId: number, cellId: number, date: Date, weekly: number): Promise<AttendanceResponse>;
  getCount(churchId: number, filter: AttendanceFilter, date: Date, weekly: number): Promise<AttendanceCountResponse>;
}
