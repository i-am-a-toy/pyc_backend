import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTimeEntity } from '../base-time.entity';
import { Church } from '../church/church.entity';
import { Creator } from '../embedded/creator.entity';
import { LastModifier } from '../embedded/last-modifier.entity';
import { User } from '../user/user.entity';

@Entity({ name: 'calendars' })
export class Calendar extends BaseTimeEntity {
  @Column({ name: 'church_id', nullable: false, type: 'integer', comment: '사용자가 속한 셀 교회' })
  churchId!: number;

  @ManyToOne(() => Church)
  @JoinColumn({ name: 'church_id' })
  church!: Church;

  @Column({ type: 'varchar', nullable: false, comment: '이벤트 타이틀' })
  title: string;

  @Column({ type: 'varchar', nullable: false, comment: '이벤트 내용' })
  content: string;

  @Column({ type: 'timestamptz', nullable: false, comment: '이벤트 시작일' })
  start: Date;

  @Column({ type: 'timestamptz', nullable: false, comment: '이벤트 종료일' })
  end: Date;

  @Column({ type: 'boolean', nullable: false, comment: '이벤트의 Duration' })
  isAllDay: boolean;

  @Column(() => Creator, { prefix: false })
  creator: Creator;

  @Column({ type: 'integer', nullable: false, comment: '생성자', name: 'created_by' })
  createdBy: number;

  @Column(() => LastModifier, { prefix: false })
  lastModifier: LastModifier;

  @Column({ type: 'integer', nullable: false, comment: '수정자', name: 'last_modified_by' })
  lastModifiedBy: number;

  cUser: User;
  mUser: User;

  static of(
    church: Church,
    user: User,
    start: Date,
    end: Date,
    isAllDay: boolean,
    title: string,
    content: string,
  ): Calendar {
    const { id, name, role } = user;

    const e = new Calendar();
    e.church = church;
    e.start = start;
    e.end = end;
    e.isAllDay = isAllDay;
    e.title = title;
    e.content = content;
    e.creator = new Creator(name, role);
    e.createdBy = id;
    e.lastModifier = new LastModifier(name, role);
    e.lastModifiedBy = id;

    return e;
  }

  uddateCalendar(user: User, start: Date, end: Date, isAllDay: boolean, title: string, content: string) {
    this.start = start;
    this.end = end;
    this.isAllDay = isAllDay;
    this.title = title;
    this.content = content;
    this.lastModifier = new LastModifier(user.name, user.role);
    this.lastModifiedBy = user.id;
  }
}
