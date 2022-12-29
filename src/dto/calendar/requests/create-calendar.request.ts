import { IsBoolean, IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { Calendar } from 'src/entities/calendar-event/calendar.entity';
import { Church } from 'src/entities/church/church.entity';
import { User } from 'src/entities/user/user.entity';

export class CreateCalendarRequest {
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsString()
  @IsNotEmpty()
  readonly content: string;

  @IsDateString()
  @IsNotEmpty()
  readonly start: string;

  @IsDateString()
  @IsNotEmpty()
  readonly end: string;

  @IsBoolean()
  @IsNotEmpty()
  readonly isAllDay: boolean;

  toEntity(church: Church, user: User): Calendar {
    return Calendar.of(church, user, new Date(this.start), new Date(this.end), this.isAllDay, this.title, this.content);
  }
}
