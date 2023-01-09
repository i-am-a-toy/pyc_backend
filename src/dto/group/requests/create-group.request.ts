import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateGroupRequest {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsNumber()
  readonly leaderId: number;
}
