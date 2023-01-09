import { IsNumber } from 'class-validator';

export class UpdateGroupLeaderRequest {
  @IsNumber()
  leaderId: number;
}
