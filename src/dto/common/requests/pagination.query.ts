import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { numberTransfrom } from 'src/common/transform/number.transfrom';

export class PaginationQuery {
  @IsNumber()
  @Transform(numberTransfrom)
  readonly offset: number = 0;

  @IsNumber()
  @Transform(numberTransfrom)
  readonly limit: number = 10;
}
