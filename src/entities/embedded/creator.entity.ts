import { RoleTransformer } from 'src/types/role/role.transformer';
import { Role } from 'src/types/role/role.type';
import { Column } from 'typeorm';

export class Creator {
  @Column({ type: 'varchar', name: 'creator_name', nullable: false, comment: '작성자의 작성 시점의 이름' })
  name!: string;

  @Column({
    type: 'varchar',
    name: 'creator_user_role',
    nullable: false,
    comment: '작성자의 작성 시점의 권한',
    transformer: new RoleTransformer(),
  })
  role!: Role;

  constructor(name: string, role: Role) {
    this.name = name;
    this.role = role;
  }
}
