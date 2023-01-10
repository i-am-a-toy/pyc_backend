import { IsNumber } from 'class-validator';

export class CreateCellRequest {
  @IsNumber()
  readonly groupId: number;
  @IsNumber()
  readonly leaderId: number;
}
