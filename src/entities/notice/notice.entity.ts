import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTimeEntity } from '../base-time.entity';
import { Church } from '../church/church.entity';
import { Creator } from '../embedded/creator.entity';
import { LastModifier } from '../embedded/last-modifier.entity';
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

  @Column({ type: 'text', nullable: false, comment: '공지사항의 본문' })
  content!: string;

  @Column(() => Creator, { prefix: false })
  creator!: Creator;

  @Column({ nullable: false, name: 'created_by', type: 'integer', comment: '데이터 생성자' })
  createdBy!: number;

  @Column(() => LastModifier, { prefix: false })
  lastModifier!: LastModifier;

  @Column({ nullable: false, name: 'last_modified_by', type: 'integer', comment: '데이터 수정자' })
  lastModifiedBy!: number;

  cUser: User;
  mUser: User;

  static of(church: Church, user: User, title: string, content: string): Notice {
    const { id, name, role } = user;
    const e = new Notice();
    e.church = church;
    e.title = title;
    e.content = content;
    e.creator = new Creator(name, role);
    e.createdBy = id;
    e.lastModifier = new LastModifier(name, role);
    e.lastModifiedBy = id;
    return e;
  }

  updateNotice(title: string, content: string, user: User) {
    this.title = title;
    this.content = content;
    this.lastModifiedBy = user.id;
    this.lastModifier = new LastModifier(user.name, user.role);
  }
}
