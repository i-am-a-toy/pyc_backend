import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { BaseTimeEntity } from '../base-time.entity';
import { Cell } from '../cell/cell.entity';
import { Church } from '../church/church.entity';
import { User } from '../user/user.entity';

@Entity({ name: 'families' })
export class Family extends BaseTimeEntity {
  @Column({ name: 'church_id', nullable: false, type: 'integer', comment: '사용자가 속한 셀 교회' })
  churchId: number;

  @ManyToOne(() => Church)
  @JoinColumn({ name: 'church_id' })
  church: Church;

  @Column({ type: 'varchar', nullable: false, comment: '팸 이름', unique: true })
  name: string;

  @Column({
    name: 'leader_id',
    type: 'integer',
    nullable: false,
    comment: '팸 리더 아이디',
  })
  leaderId: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'leader_id' })
  leader: User;

  @Column({
    name: 'sub_leader_id',
    type: 'integer',
    nullable: true,
    comment: '팸의 서브리더 아이디',
  })
  subLeaderId: number | null;

  @OneToOne(() => User)
  @JoinColumn({ name: 'sub_leader_id' })
  subLeader: User | null;

  @OneToMany(() => Cell, (cell) => cell.family)
  cells: Cell[];

  static of(church: Church, name: string, leader: User, subLeader: User | null): Family {
    const family = new Family();
    family.church = church;
    family.name = name;
    family.leader = leader;
    family.subLeader = subLeader;
    return family;
  }

  changeName(name: string): void {
    this.name = name;
  }

  changeLeader(leader: User): void {
    this.leader = leader;
  }

  changeSubLeader(subLeader: User | null): void {
    this.subLeader = subLeader;
  }
}
