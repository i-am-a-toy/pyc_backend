import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GetCellAttendanceCountQuery {
  @IsString()
  @IsNotEmpty()
  date: string;

  @IsNumber()
  weekly: number;
}
