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

  @Column({ type: 'varchar', nullable: true, comment: '이벤트 내용' })
  content: string | null;

  @Column({ type: 'timestamptz', nullable: false, comment: '이벤트 시작일' })
  start: Date;

  @Column({ type: 'timestamptz', nullable: false, comment: '이벤트 종료일' })
  end: Date;

  @Column({ type: 'boolean', nullable: false, comment: '이벤트의 Duration' })
  isAllDay: boolean;

  @Column(() => Creator, { prefix: false })
  creator: Creator;

  @Column({ type: 'timestamptz', nullable: false, comment: '생성일' })
  createdBy: Date;

  @Column(() => LastModifier, { prefix: false })
  lastModifier: LastModifier;

  @Column({ type: 'timestamptz', nullable: false, comment: '수정일' })
  lastModifiedAt: Date;

  cUser: User;
  mUser: User;
}
