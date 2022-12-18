import { IsBoolean, IsDate, IsDateString, IsNotEmpty, IsString } from 'class-validator';
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

  @IsDate()
  @IsNotEmpty()
  readonly start: Date;

  @IsDate()
  @IsNotEmpty()
  readonly end: Date;

  @IsBoolean()
  @IsNotEmpty()
  readonly isAllDay: boolean;

  toEntity(church: Church, user: User): Calendar {
    return Calendar.of(church, user, this.start, this.end, this.isAllDay, this.title, this.content);
  }
}
