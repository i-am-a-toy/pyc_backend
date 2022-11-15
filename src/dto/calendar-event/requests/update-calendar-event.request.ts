import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCalendarEventRequest {
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsString()
  @IsOptional()
  readonly content: string;

  @IsDateString()
  @IsNotEmpty()
  readonly start: Date;

  @IsDateString()
  @IsNotEmpty()
  readonly end: Date;
}
