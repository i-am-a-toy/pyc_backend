import { plainToInstance } from 'class-transformer';
import { Church } from 'src/entities/church/church.entity';
import { Created } from 'src/entities/embedded/created.entity';
import { LastModified } from 'src/entities/embedded/last-modified.entity';
import { Notice } from 'src/entities/notice/notice.entity';
import { User } from 'src/entities/user/user.entity';

export const getMockNotice = (church: Church, title: string, content: string, user: User): Notice => {
  return plainToInstance(Notice, {
    church,
    title,
    content,
    created: new Created(user.id, user.name, user.role),
    lastModified: new LastModified(user.id, user.name, user.role),
  });
};
