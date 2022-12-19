import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class UpdateCalendarRequest {
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsString()
  @IsNotEmpty()
  readonly content: string;

  @IsNotEmpty()
  readonly start: Date;

  @IsNotEmpty()
  readonly end: Date;

  @IsBoolean()
  @IsNotEmpty()
  readonly isAllDay: boolean;
}
