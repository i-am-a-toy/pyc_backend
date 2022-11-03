import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IFactories } from 'src/common/interfaces/factories.interface';
import { AttendanceRequest } from 'src/dto/attendance/requests/attendance.request';
import { AttendanceCountResponse } from 'src/dto/attendance/responses/attendance-count.response';
import { AttendanceResponse } from 'src/dto/attendance/responses/attendance.response';
import { Attendance } from 'src/entities/attendnace/attendance.entity';
import { Cell } from 'src/entities/cell/cell.entity';
import { Church } from 'src/entities/church/church.entity';
import { AttendanceFilter } from 'src/enum/attendance-filter-type.enum';
import { DataSource, Repository } from 'typeorm';
import { AttendanceCountFactoryKey } from '../factories/attendance-count.factory';
import { IAttendanceCountService } from '../interfaces/attendance-count.interface';
import { IAttendanceService } from '../interfaces/attendance-service.interface';

export const AttendanceServiceKey = 'AttendanceServiceKey';

@Injectable()
export class AttendanceService implements IAttendanceService {
  private readonly logger: Logger = new Logger(AttendanceService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Attendance) private readonly repository: Repository<Attendance>,
    @Inject(AttendanceCountFactoryKey)
    private readonly factory: IFactories<AttendanceFilter, IAttendanceCountService>,
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
    const selected = await this.repository.findOneByOrFail({
      churchId,
      cellId,
      attendanceDate: date,
      attendanceWeekly: weekly,
    });

    return new AttendanceResponse(selected);
  }

  async getCount(
    churchId: number,
    filter: AttendanceFilter,
    date: Date,
    weekly?: number,
  ): Promise<AttendanceCountResponse> {
    return await this.factory.getInstance(filter).getAttendance(churchId, date, weekly);
  }
}
