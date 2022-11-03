import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { AttendanceFilter } from 'src/enum/attendance-filter-type.enum';

export class GetAttendanceCountQuery {
  @IsString()
  @IsNotEmpty()
  date: string;

  @IsEnum(AttendanceFilter)
  filter: AttendanceFilter;

  @IsOptional()
  @IsNumber()
  weekly: number;
}
