import { User } from 'src/entities/user/user.entity';

export class UserResponse {
  readonly id: number;
  readonly churchId: number;
  readonly cellId: number | null;
  readonly name: string;
  readonly image: string;
  readonly age: number;
  readonly role: string;
  readonly rank: string;
  readonly gender: string;
  readonly zipCode: string;
  readonly address: string;
  readonly birth: string;
  readonly contact: string;
  readonly isLongAbsenced: boolean;

  constructor(user: User) {
    this.id = user.id;
    this.churchId = user.churchId;
    this.cellId = user.cellId;
    this.name = user.name;
    this.image = user.image;
    this.age = user.age;
    this.role = user.role.name;
    this.rank = user.rank.name;
    this.gender = user.gender.name;
    this.zipCode = user.address.zipCode ?? '';
    this.address = user.address.address ?? '';
    this.birth = user.birth;
    this.contact = user.contact;
    this.isLongAbsenced = user.isLongAbsenced;
  }
}
