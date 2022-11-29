import { IsNotEmpty, IsString } from 'class-validator';
import { Church } from 'src/entities/church/church.entity';
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
    return Notice.of(church, user, this.title, this.content);
  }
}
