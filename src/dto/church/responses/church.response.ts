import { Church } from 'src/entities/church/church.entity';

export class ChurchResponse {
  readonly id: number;
  readonly name: string;
  readonly zipCode: string;
  readonly address: string;
  readonly managerName: string;
  readonly managerContact: string;
  readonly createdAt: Date;

  constructor(church: Church) {
    this.id = church.id;
    this.name = church.name;
    this.zipCode = church.address.zipCode;
    this.address = church.address.address;
    this.managerName = church.managerName;
    this.managerContact = church.managerContact;
    this.createdAt = church.createdAt;
  }
}
