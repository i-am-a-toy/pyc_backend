import { IsNotEmpty, IsString } from 'class-validator';
import { Church } from 'src/entities/church/church.entity';
import { Created } from 'src/entities/embedded/created.entity';
import { LastModified } from 'src/entities/embedded/last-modified.entity';
import { Notice } from 'src/entities/notice/notice.entity';
import { User } from 'src/entities/user/user.entity';

export class CreateNoticeRequest {
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsString()
  @IsNotEmpty()
  readonly content: string;

  toEntity(church: Church, user: User): Notice {
    const e = new Notice();
    e.church = church;
    e.title = this.title;
    e.content = this.content;
    e.created = new Created(user.id, user.name, user.image, user.role);
    e.lastModified = new LastModified(user.id, user.name, user.image, user.role);
    return e;
  }
}
