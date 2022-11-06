import { Notice } from 'src/entities/notice/notice.entity';

export class NoticeResponse {
  readonly id: number;
  readonly title: string;
  readonly content: string;
  readonly name: string;
  readonly role: string;
  readonly createdAt: Date;
  readonly lastModifiedAt: Date;

  constructor(e: Notice) {
    this.id = e.id;
    this.title = e.title;
    this.content = e.content;
    this.name = e.createdUser ? e.createdUser.name : e.created.name;
    this.role = e.createdUser ? e.createdUser.role.name : e.created.role.name;
    this.createdAt = e.createdAt;
    this.lastModifiedAt = e.lastModifiedAt;
  }
}
