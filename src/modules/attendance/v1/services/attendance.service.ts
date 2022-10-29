import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendanceRequest } from 'src/dto/attendance/requests/attendance.request';
import { AttendanceCountResponse } from 'src/dto/attendance/responses/attendance-count.response';
import { AttendanceResponse } from 'src/dto/attendance/responses/attendance.response';
import { Attendance } from 'src/entities/attendnace/attendance.entity';
import { Cell } from 'src/entities/cell/cell.entity';
import { Church } from 'src/entities/church/church.entity';
import { AttendanceFilterType } from 'src/enum/attendance-filter-type.enum';
import { DataSource, Repository } from 'typeorm';
import { IAttendanceService } from '../interfaces/attendance-service.interface';

@Injectable()
export class AttendanceService implements IAttendanceService {
  private readonly logger: Logger = new Logger(AttendanceService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Attendance) private readonly repository: Repository<Attendance>,
  ) {}

  async attend(req: AttendanceRequest): Promise<void> {
    const qr = this.dataSource.createQueryRunner();
    await qr.startTransaction();

    try {
      const church = await qr.manager.findOneByOrFail(Church, { id: req.churchId });
      const cell = await qr.manager.findOneByOrFail(Cell, { id: req.cellId });
      const entity = req.toEntity(church, cell);

      await qr.manager.save(Attendance, entity);
      await qr.commitTransaction();
    } catch (e) {
      this.logger.warn(`attend failed error: ${e.message}`);
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  async findOneByCellAndDate(
    churchId: number,
    cellId: number,
    date: Date,
    weekly: number,
  ): Promise<AttendanceResponse> {
    throw new Error('Method not implemented.');
  }
  async getWeeklyCount(churchId: number, filter: AttendanceFilterType, date: Date): Promise<AttendanceCountResponse> {
    throw new Error('Method not implemented.');
  }
}
