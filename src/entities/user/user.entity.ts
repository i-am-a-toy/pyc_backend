import { genSaltSync, hashSync } from 'bcrypt';
import { UpdateUserRequest } from 'src/dto/user/requests/update-user.request';
import { GenderTransformer } from 'src/types/gender/gender.transformer';
import { Gender } from 'src/types/gender/gender.type';
import { RankTransformer } from 'src/types/rank/rank.transformer';
import { Rank } from 'src/types/rank/rank.type';
import { RoleTransformer } from 'src/types/role/role.transformer';
import { Role } from 'src/types/role/role.type';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTimeEntity } from '../base-time.entity';
import { Cell } from '../cell/cell.entity';
import { Church } from '../church/church.entity';
import { Address } from '../embedded/address.entity';

@Entity({ name: 'users' })
export class User extends BaseTimeEntity {
  @Column({ name: 'church_id', nullable: false, type: 'integer', comment: '사용자가 속한 셀 교회' })
  churchId: number;

  @ManyToOne(() => Church)
  @JoinColumn({ name: 'church_id' })
  church: Church;

  @Column({ name: 'cell_id', nullable: true, type: 'integer', comment: '사용자가 속한 셀 ID' })
  cellId: number | null;

  @ManyToOne(() => Cell, (cell) => cell.members)
  @JoinColumn({ name: 'cell_id' })
  cell: Cell | null;

  @Column({
    type: 'varchar',
    nullable: false,
    comment: '사용자 이름 및 ID',
    unique: true,
  })
  name: string;

  @Column({
    type: 'varchar',
    nullable: true,
    comment: '사용자 비밀번호',
  })
  password: string | null;

  @Column({ nullable: false, type: 'varchar', comment: '사용자 프로필 이미지' })
  image: string;

  @Column({ nullable: false, type: 'integer', comment: '사용자 나이' })
  age: number;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 20,
    comment: '사용자의 권한 및 역할',
    transformer: new RoleTransformer(),
  })
  role: Role;

  @Column({
    nullable: false,
    type: 'varchar',
    length: 15,
    comment: '사용자의 세례여부',
    transformer: new RankTransformer(),
  })
  rank: Rank;

  @Column({
    nullable: false,
    type: 'varchar',
    length: 10,
    comment: '사용자 성별',
    transformer: new GenderTransformer(),
  })
  gender: Gender;

  @Column({
    type: 'varchar',
    nullable: false,
    comment: '사용자 생년월일',
  })
  birth: string;

  @Column(() => Address, { prefix: false })
  address: Address;

  @Column({
    type: 'varchar',
    nullable: false,
    comment: '사용자 연락처',
  })
  contact: string;

  // is_long_absenced
  @Column({
    type: 'boolean',
    nullable: false,
    comment: '장기결석 여부',
  })
  isLongAbsenced: boolean;

  // update
  changeCell(cell: Cell) {
    this.cell = cell;
  }

  changeChurch(church: Church) {
    this.church = church;
  }

  changeRole(role: Role): void {
    this.role = role;
  }

  changePassword(password: string) {
    const solt = genSaltSync(10);
    this.password = hashSync(password, solt);
  }

  toBeLeader(): void {
    if (this.role.code < Role.LEADER.code) return;
    this.role = Role.LEADER;
  }

  putDownLeader() {
    if (this.role.code < Role.JUNIOR_PASTOR.code) return;
    this.role = Role.MEMBER;
    this.cell = null;
    this.password = null;
  }

  updateFromRequest(req: UpdateUserRequest) {
    this.age = req.age;
    this.rank = req.rank;
    this.gender = req.gender;
    this.birth = req.birth;
    this.address = new Address(req.zipCode ?? '', req.address ?? '');
    this.contact = req.contact;
    this.isLongAbsenced = req.isLongAbsenced;
  }
}
