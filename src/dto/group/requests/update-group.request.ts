import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateGroupRequest {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsNumber()
  readonly leaderId: number;
}
