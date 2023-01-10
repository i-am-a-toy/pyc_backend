import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseTimeEntity } from '../base-time.entity';
import { Church } from '../church/church.entity';
import { Group } from '../group/group.entity';
import { User } from '../user/user.entity';

@Entity({ name: 'cells' })
export class Cell extends BaseTimeEntity {
  @Column({ name: 'church_id', nullable: false, type: 'integer', comment: '셀이 속한 교회의 아이디' })
  churchId: number;

  @ManyToOne(() => Church)
  @JoinColumn({ name: 'church_id' })
  church: Church;

  @Column({ name: 'group_id', nullable: true, type: 'integer', comment: '셀이 속한 그룹의 아이디' })
  groupId: number | null;

  @ManyToOne(() => Group)
  @JoinColumn({ name: 'group_id' })
  group: Group | null;

  @Column({ name: 'leader_id', nullable: false, type: 'integer', comment: '셀 리더의 아이디' })
  leaderId: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'leader_id' })
  leader: User;

  @Column({ nullable: false, type: 'varchar', comment: '셀 이름', unique: true })
  name: string;

  @Column({ type: 'integer', nullable: false, comment: '생성자' })
  createdBy: number;

  @Column({ type: 'integer', nullable: false, comment: '수정자' })
  lastModifiedBy: number;

  static of(church: Church, group: Group | null, user: User, userId: number): Cell {
    const cell = new Cell();
    cell.church = church;
    cell.group = group;
    cell.leader = user;
    cell.name = `${user.name}셀`;
    cell.createdBy = userId;
    return cell;
  }

  changeGroup(group: Group | null): void {
    this.group = group;
  }

  changeLeader(user: User): void {
    this.leader = user;
    this.name = `${user.name}셀`;
  }
}
