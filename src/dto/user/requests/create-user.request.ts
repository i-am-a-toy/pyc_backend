import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString } from 'class-validator';
import * as gravatar from 'gravatar';
import { Address } from 'src/entities/embedded/address.entity';
import { User } from 'src/entities/user/user.entity';
import { Gender } from 'src/types/gender/gender.type';
import { genderValidator } from 'src/types/gender/gender.validator';
import { Rank } from 'src/types/rank/rank.type';
import { rankValidator } from 'src/types/rank/rank.validator';
import { Role } from 'src/types/role/role.type';
import { roleValidator } from 'src/types/role/role.validator';
import * as uuid from 'uuid';

export class CreateUserRequest {
  /**
   * @description
   * cellId === null + role === newbie => 새신자
   */
  @IsNumber()
  @IsOptional()
  readonly cellId: number | null; // nullable

  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsNumber()
  readonly age: number;

  @Transform(roleValidator)
  @IsNotEmpty()
  readonly role: Role;

  @Transform(rankValidator)
  @IsNotEmpty()
  readonly rank: Rank;

  @Transform(genderValidator)
  @IsNotEmpty()
  readonly gender: Gender;

  @IsDateString()
  @IsNotEmpty()
  readonly birth: string;

  @IsNumberString()
  @IsOptional()
  readonly zipCode: string | null; // nullable

  @IsString()
  @IsOptional()
  readonly address: string | null; // nullable

  @IsString()
  @IsNotEmpty()
  readonly contact: string;

  @IsBoolean()
  readonly isLongAbsenced = false;

  toEntity(): User {
    const user = new User();
    user.name = this.name;
    user.age = this.age;
    user.role = this.role;
    user.rank = this.rank;
    user.gender = this.gender;
    user.birth = this.birth;
    user.address = new Address(this.zipCode ?? '', this.address ?? '');
    user.contact = this.contact;
    user.isLongAbsenced = this.isLongAbsenced;

    //initial image
    //profile
    user.image = gravatar.url(this.name + uuid.v4(), { d: 'robohash', protocol: 'https' });
    return user;
  }
}
