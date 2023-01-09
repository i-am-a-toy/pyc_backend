import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseTimeEntity } from '../base-time.entity';
import { Church } from '../church/church.entity';
import { User } from '../user/user.entity';

@Entity({ name: 'groups' })
export class Group extends BaseTimeEntity {
  @Column({ name: 'church_id', nullable: false, type: 'integer', comment: '사용자가 속한 셀 교회' })
  churchId: number;

  @ManyToOne(() => Church)
  @JoinColumn({ name: 'church_id' })
  church: Church;

  @Column({
    name: 'leader_id',
    type: 'integer',
    nullable: true,
    comment: '그룹 리더의 Id',
  })
  leaderId: number | null;

  @OneToOne(() => User)
  @JoinColumn({ name: 'leader_id' })
  leader: User | null;

  @Column({ type: 'varchar', nullable: false, comment: '이름' })
  name: string;

  @Column({ type: 'integer', nullable: false, comment: '생성자' })
  createdBy: number;

  @Column({ type: 'integer', nullable: false, comment: '수정자' })
  lastModifiedBy: number;

  static of(church: Church, leader: User, name: string, userId: number): Group {
    const e = new Group();
    e.church = church;
    e.name = name;
    e.leader = leader;
    e.createdBy = userId;
    e.lastModifiedBy = userId;
    return e;
  }

  changeName(name: string, userId: number) {
    this.name = name;
    this.lastModifiedBy = userId;
  }

  changeLeader(leader: User, userId: number) {
    this.leader = leader;
    this.lastModifiedBy = userId;
  }
}
