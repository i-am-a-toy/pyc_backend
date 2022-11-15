import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTimeEntity } from '../base-time.entity';
import { Church } from '../church/church.entity';
import { Created } from '../embedded/created.entity';
import { LastModified } from '../embedded/last-modified.entity';

@Entity({ name: 'calendar_events' })
export class CalendarEvent extends BaseTimeEntity {
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

  @Column(() => Created, { prefix: false })
  created: Created;

  @Column(() => LastModified, { prefix: false })
  lastModified: LastModified;
}
