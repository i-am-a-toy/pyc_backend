import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateGroupRequest {
  @IsNumber()
  readonly churchId: number;

  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsNumber()
  readonly leaderId: number;
}
