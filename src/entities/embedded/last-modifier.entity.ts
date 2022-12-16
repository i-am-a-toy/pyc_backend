import { RoleTransformer } from 'src/types/role/role.transformer';
import { Role } from 'src/types/role/role.type';
import { Column } from 'typeorm';

export class LastModifier {
  @Column({ type: 'varchar', name: 'last_modifier_name', nullable: false, comment: '수정자' })
  name!: string;

  @Column({
    type: 'varchar',
    name: 'last_modifier_role',
    nullable: false,
    comment: '수정자의 작성 시점의 권한',
    transformer: new RoleTransformer(),
  })
  role!: Role;

  constructor(name: string, role: Role) {
    this.name = name;
    this.role = role;
  }
}
