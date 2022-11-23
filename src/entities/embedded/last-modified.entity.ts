import { RoleTransformer } from 'src/types/role/role.transformer';
import { Role } from 'src/types/role/role.type';
import { Column } from 'typeorm';

export class LastModified {
  @Column({ type: 'integer', name: 'last_modified_by', nullable: false, comment: '수정자의 Id' })
  by!: number;

  @Column({ type: 'varchar', name: 'last_modified_name', nullable: false, comment: '수정자' })
  name!: string;

  @Column({ type: 'varchar', name: 'last_modified_image', nullable: false, comment: '수정자 프로필 이미지' })
  image!: string;

  @Column({
    type: 'varchar',
    name: 'last_modified_role',
    nullable: false,
    comment: '수정자의 작성 시점의 권한',
    transformer: new RoleTransformer(),
  })
  role!: Role;

  constructor(by: number, name: string, image: string, role: Role) {
    this.by = by;
    this.name = name;
    this.image = image;
    this.role = role;
  }
}
