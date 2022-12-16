import { CreatorDto } from 'src/dto/common/dto/creator.dto';
import { LastModifierDto } from 'src/dto/common/dto/last-modifier.dto';
import { Notice } from 'src/entities/notice/notice.entity';

export class NoticeResponse {
  readonly id: number;
  readonly title: string;
  readonly content: string;
  readonly creator: CreatorDto;
  readonly lastModifier: LastModifierDto;
  readonly createdAt: Date;
  readonly lastModifiedAt: Date;

  constructor(e: Notice) {
    const { creator, cUser, lastModifier, mUser } = e;

    this.id = e.id;
    this.title = e.title;
    this.content = e.content;
    this.creator = new CreatorDto(cUser, creator);
    this.lastModifier = new LastModifierDto(mUser, lastModifier);
    this.createdAt = e.createdAt;
    this.lastModifiedAt = e.lastModifiedAt;
  }
}
