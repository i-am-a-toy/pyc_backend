import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordRequest {
  @IsNotEmpty()
  @IsString()
  prevPassword: string;

  @IsNotEmpty()
  @IsString()
  newPassword: string;
}
