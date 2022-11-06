import { RoleTransformer } from 'src/types/role/role.transformer';
import { Role } from 'src/types/role/role.type';
import { Column } from 'typeorm';

export class Created {
  @Column({ type: 'integer', name: 'created_by', nullable: false, comment: '작성자의 Id' })
  by!: number;

  @Column({ type: 'varchar', name: 'created_name', nullable: false, comment: '작성자의 작성 시점의 이름' })
  name!: string;

  @Column({
    type: 'varchar',
    name: 'created_role',
    nullable: false,
    comment: '작성자의 작성 시점의 권한',
    transformer: new RoleTransformer(),
  })
  role!: Role;

  constructor(by: number, name: string, role: Role) {
    this.by = by;
    this.name = name;
    this.role = role;
  }
}
