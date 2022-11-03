import { Attendance } from 'src/entities/attendnace/attendance.entity';

export class AttendanceResponse {
  readonly id: number;
  readonly churchId: number;
  readonly cellId: number;
  readonly worshipAttendance: number[];
  readonly groupAttendance: number[];
  readonly attendanceDate: Date;
  readonly attendanceWeekly: number;

  constructor(entity: Attendance) {
    this.id = entity.id;
    this.churchId = entity.churchId;
    this.cellId = entity.cellId;
    this.worshipAttendance = entity.worthshipAttendance ? entity.worthshipAttendance : [];
    this.groupAttendance = entity.groupAttendance ? entity.groupAttendance : [];
    this.attendanceDate = entity.attendanceDate;
    this.attendanceWeekly = entity.attendanceWeekly;
  }
}
