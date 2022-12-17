import { plainToInstance } from 'class-transformer';
import { Calendar } from 'src/entities/calendar-event/calendar.entity';
import { Church } from 'src/entities/church/church.entity';
import { Creator } from 'src/entities/embedded/creator.entity';
import { User } from 'src/entities/user/user.entity';

export const getMockCalendars = (church: Church, user: User): Calendar[] => {
  return [
    Calendar.of(church, user, new Date('2022-12-17'), new Date('2022-12-17'), true, 'titleA', 'contentA'),
    Calendar.of(church, user, new Date('2022-12-18'), new Date('2022-12-18'), true, 'titleB', 'contentB'),
    Calendar.of(church, user, new Date('2022-12-19'), new Date('2022-12-25'), true, 'titleC', 'contentC'),
    Calendar.of(church, user, new Date('2022-12-26'), new Date('2022-12-31'), true, 'titleD', 'contentD'),
    Calendar.of(church, user, new Date('2022-01-01'), new Date('2022-01-01'), true, 'titleE', 'contentE'),
  ];
};
