import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumberString } from 'class-validator';

export class CalendarListQuery {
  @IsNumberString()
  @IsNotEmpty()
  year: string;

  @IsNumberString()
  @IsNotEmpty()
  month: string;

  @Transform(({ value }) => {
    return value ? Number.parseInt(value) : undefined;
  })
  readonly offset?: number;

  @Transform(({ value }) => {
    return value ? Number.parseInt(value) : undefined;
  })
  readonly limit?: number;
}
