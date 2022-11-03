import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { PycContext } from 'src/core/decorator/pyc-user.decorator';
import { AttendanceRequest } from 'src/dto/attendance/requests/attendance.request';
import { GetAttendanceCountQuery } from 'src/dto/attendance/requests/get-attendance-count.query';
import { GetCellAttendanceCountQuery } from 'src/dto/attendance/requests/get-cell-attendance-count.query copy';
import { AttendanceCountResponse } from 'src/dto/attendance/responses/attendance-count.response';
import { AttendanceResponse } from 'src/dto/attendance/responses/attendance.response';
import { PycUser } from 'src/dto/common/dto/pyc-user.dto';
import { IAttendanceService } from '../interfaces/attendance-service.interface';
import { AttendanceServiceKey } from '../services/attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(@Inject(AttendanceServiceKey) private readonly service: IAttendanceService) {}

  @Post()
  async atteand(@Body() req: AttendanceRequest): Promise<void> {
    await this.service.attend(req);
  }

  @Get('/:cellId')
  async getCellAttendance(
    @PycContext() user: PycUser,
    @Param('cellId', ParseIntPipe) id: number,
    @Query() query: GetCellAttendanceCountQuery,
  ): Promise<AttendanceResponse> {
    return this.service.findOneByCellAndDate(user.churchId, id, new Date(query.date), query.weekly);
  }

  @Get()
  async getAttendanceCount(
    @PycContext() user: PycUser,
    @Query() query: GetAttendanceCountQuery,
  ): Promise<AttendanceCountResponse> {
    return this.service.getCount(user.churchId, query.filter, new Date(query.date), query.weekly);
  }
}
