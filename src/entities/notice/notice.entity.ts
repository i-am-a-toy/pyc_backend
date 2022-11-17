import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTimeEntity } from '../base-time.entity';
import { Church } from '../church/church.entity';
import { Created } from '../embedded/created.entity';
import { LastModified } from '../embedded/last-modified.entity';
import { NoticeComment } from '../notice-comment/notice-comment.entity';
import { User } from '../user/user.entity';

@Entity({ name: 'notices' })
export class Notice extends BaseTimeEntity {
  @Column({ name: 'church_id', nullable: false, type: 'integer', comment: '사용자가 속한 셀 교회' })
  churchId!: number;

  @ManyToOne(() => Church)
  @JoinColumn({ name: 'church_id' })
  church!: Church;

  @Column({ type: 'varchar', nullable: false, comment: '공지사항의 제목' })
  title!: string;

  @Column({ type: 'varchar', nullable: false, comment: '공지사항의 본문' })
  content!: string;

  @Column(() => Created, { prefix: false })
  created: Created;

  @Column(() => LastModified, { prefix: false })
  lastModified: LastModified;

  createdUser: User;
  lastModifiedUser: User;
  noticeComments: NoticeComment[];

  updateNotice(title: string, content: string, user: User) {
    this.title = title;
    this.content = content;
    this.lastModified = new LastModified(user.id, user.name, user.role);
  }
}
