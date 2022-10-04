import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class UpdateChurchRequest {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsNumberString()
  readonly zipCode: string;

  @IsString()
  readonly address: string;

  @IsString()
  @IsNotEmpty()
  readonly managerName: string;

  @IsString()
  @IsNotEmpty()
  readonly managerContact: string;
}
