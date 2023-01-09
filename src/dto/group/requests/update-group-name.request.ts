import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateGroupNameRequest {
  @IsString()
  @IsNotEmpty()
  readonly name: string;
}
