import { IsDateString, IsNumber } from 'class-validator';
import { Attendance } from 'src/entities/attendnace/attendance.entity';
import { Cell } from 'src/entities/cell/cell.entity';
import { Church } from 'src/entities/church/church.entity';

export class AttendanceRequest {
  @IsNumber()
  readonly churchId: number;

  @IsNumber()
  readonly cellId: number;

  @IsNumber({}, { each: true })
  readonly worthshipAttendance: number[] = [];

  @IsNumber({}, { each: true })
  readonly groupAttendance: number[] = [];

  @IsDateString()
  readonly attendanceDate: string;

  @IsNumber()
  readonly attendanceWeekly: number;

  toEntity(church: Church, cell: Cell): Attendance {
    return Attendance.of(
      church,
      cell,
      this.worthshipAttendance,
      this.groupAttendance,
      new Date(this.attendanceDate),
      this.attendanceWeekly,
    );
  }
}
