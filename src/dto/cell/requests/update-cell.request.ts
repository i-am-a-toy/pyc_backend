import { IsNumber } from 'class-validator';

export class UpdateCellRequest {
  @IsNumber()
  readonly familyId: number;
  @IsNumber()
  readonly leaderId: number;
}
