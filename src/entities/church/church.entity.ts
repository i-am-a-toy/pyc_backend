import { Column, Entity } from 'typeorm';
import { BaseTimeEntity } from '../base-time.entity';
import { Address } from '../embedded/address.entity';

// id, 교회 명, 주소, 담당자, 연락처,

@Entity({ name: 'churches' })
export class Church extends BaseTimeEntity {
  @Column({ type: 'varchar', nullable: false, comment: '그룹 명' })
  name: string;

  @Column(() => Address, { prefix: false })
  address: Address;

  @Column({ type: 'varchar', nullable: false, comment: '담당자 이름' })
  managerName: string;

  @Column({ type: 'varchar', nullable: false, comment: '담당자 연락처' })
  managerContact: string;

  static of(name: string, address: Address, managerName: string, managerContact: string): Church {
    const church = new Church();
    church.name = name;
    church.address = address;
    church.managerName = managerName;
    church.managerContact = managerContact;
    return church;
  }
}
