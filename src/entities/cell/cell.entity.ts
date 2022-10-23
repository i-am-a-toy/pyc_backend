import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { BaseTimeEntity } from '../base-time.entity';
import { Church } from '../church/church.entity';
import { Family } from '../family/family.entity';
import { User } from '../user/user.entity';

@Entity({ name: 'cells' })
export class Cell extends BaseTimeEntity {
  @Column({ name: 'church_id', nullable: false, type: 'integer', comment: '셀이 속한 교회의 아이디' })
  churchId: number;

  @ManyToOne(() => Church)
  @JoinColumn({ name: 'church_id' })
  church: Church;

  @Column({ name: 'family_id', nullable: true, type: 'integer', comment: '셀이 속한 팸의 아이디' })
  familyId: number | null;

  @ManyToOne(() => Family)
  @JoinColumn({ name: 'family_id' })
  family: Family | null;

  @Column({ name: 'leader_id', nullable: false, type: 'integer', comment: '셀 리더의 아이디' })
  leaderId: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'leader_id' })
  leader: User;

  @Column({ nullable: false, type: 'varchar', comment: '셀 이름', unique: true })
  name: string;

  @OneToMany(() => User, (user) => user.cell)
  members: User[];

  static of(church: Church, family: Family | null, user: User): Cell {
    const cell = new Cell();
    cell.church = church;
    cell.family = family;
    cell.leader = user;
    cell.name = `${user.name}셀`;
    return cell;
  }

  changeFamily(family: Family | null): void {
    this.family = family;
  }

  changeLeader(user: User): void {
    this.leader = user;
    this.name = `${user.name}셀`;
  }
}
