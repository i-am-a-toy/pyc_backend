export class AttendanceCountResponse {
  readonly worthshipAttendance: number;
  readonly groupAttendance: number;

  constructor(worthshipAttendance: number, groupAttendance: number) {
    this.worthshipAttendance = worthshipAttendance;
    this.groupAttendance = groupAttendance;
  }
}
