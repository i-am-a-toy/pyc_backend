import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class PaginationQuery {
  @IsNumber({ allowNaN: false }, { message: 'Offset must be a number' })
  @Transform(({ value }) => {
    if (Number.isNaN(value)) return 0;
    return Number.parseInt(value);
  })
  readonly offset: number = 0;

  @IsNumber({ allowNaN: false }, { message: 'Limit must be a number' })
  @Transform(({ value }) => {
    if (Number.isNaN(value)) return 20;
    return Number.parseInt(value);
  })
  readonly limit: number = 10;
}
