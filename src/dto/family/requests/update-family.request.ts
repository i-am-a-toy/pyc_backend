import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateFamilyRequest {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsNumber()
  readonly leaderId: number;

  @IsNumber()
  @IsOptional()
  readonly subLeaderId: number | null;
}
