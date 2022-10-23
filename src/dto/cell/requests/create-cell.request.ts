import { IsNumber } from 'class-validator';

export class CreateCellRequest {
  @IsNumber()
  readonly familyId: number;
  @IsNumber()
  readonly leaderId: number;
}
