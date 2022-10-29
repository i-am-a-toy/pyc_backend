import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTimeEntity } from '../base-time.entity';
import { Cell } from '../cell/cell.entity';
import { Church } from '../church/church.entity';

@Entity()
export class Attendance extends BaseTimeEntity {
  @Column({ name: 'church_id', nullable: false, type: 'integer', comment: '셀이 속한 교회' })
  churchId: number;

  @ManyToOne(() => Church)
  @JoinColumn({ name: 'church_id', referencedColumnName: 'id' })
  church: Church;

  @Column({ name: 'cell_id', nullable: false, type: 'integer', comment: '출석체크의 대상이 되는 셀' })
  cellId: number;

  @ManyToOne(() => Cell)
  @JoinColumn({ name: 'cell_id', referencedColumnName: 'id' })
  cell: Cell;

  @Column({ name: 'worship_attendance', type: 'int', array: true, nullable: true, comment: '예배 참석 인원' })
  worthshipAttendance: number[] | null;

  @Column({ name: 'group_attendance', type: 'int', array: true, nullable: true, comment: '모임 참석 인원' })
  groupAttendance: number[] | null;

  @Column({ name: 'attendance_date', type: 'timestamptz', nullable: false, comment: '출석체크 weekly의 날짜' })
  attendanceDate: Date;

  @Column({ name: 'attendance_weekly', type: 'timestamptz', nullable: false, comment: '출석체크 weekly' })
  attendanceWeekly: number;
}
