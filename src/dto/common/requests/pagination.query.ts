import { IsNumber } from 'class-validator';

export class PaginationQuery {
  @IsNumber({ allowNaN: false }, { message: 'Offset must be a number' })
  readonly offset: number = 0;

  @IsNumber({ allowNaN: false }, { message: 'Limit must be a number' })
  readonly limit: number = 10;
}
