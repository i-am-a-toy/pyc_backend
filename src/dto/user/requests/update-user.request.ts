import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString } from 'class-validator';
import { Gender } from 'src/types/gender/gender.type';
import { genderValidator } from 'src/types/gender/gender.validator';
import { Rank } from 'src/types/rank/rank.type';
import { rankValidator } from 'src/types/rank/rank.validator';

export class UpdateUserRequest {
  @IsNumber()
  readonly age: number;

  @Transform(rankValidator)
  @IsNotEmpty()
  readonly rank: Rank;

  @Transform(genderValidator)
  @IsNotEmpty()
  readonly gender: Gender;

  @IsDateString()
  @IsNotEmpty()
  readonly birth: string;

  @IsNumberString()
  @IsOptional()
  readonly zipCode: string | null; // nullable

  @IsString()
  @IsOptional()
  readonly address: string | null; // nullable

  @IsString()
  @IsNotEmpty()
  readonly contact: string;

  @IsBoolean()
  readonly isLongAbsenced: boolean;
}
