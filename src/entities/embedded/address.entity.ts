import { Column } from 'typeorm';

export class Address {
  @Column({ type: 'varchar', nullable: false, comment: '우편번호' })
  zipCode!: string;

  @Column({ type: 'varchar', nullable: false, comment: '주소' })
  address!: string;

  constructor(zipCode: string, address: string) {
    this.zipCode = zipCode;
    this.address = address;
  }
}
