import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendanceCountResponse } from 'src/dto/attendance/responses/attendance-count.response';
import { Attendance } from 'src/entities/attendnace/attendance.entity';
import { Repository } from 'typeorm';
import { IAttendanceCountService } from '../interfaces/attendance-count.interface';

@Injectable()
export class YearAttendanceCountService implements IAttendanceCountService {
  constructor(private readonly repository: Repository<Attendance>) {}

  async getAttendance(churchId: number, date: Date): Promise<AttendanceCountResponse> {
    throw new Error('Method not implemented.');
  }
}
