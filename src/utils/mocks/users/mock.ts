import { plainToInstance } from 'class-transformer';
import { CreateUserRequest } from 'src/dto/user/requests/create-user.request';
import { Cell } from 'src/entities/cell/cell.entity';
import { Church } from 'src/entities/church/church.entity';
import { Address } from 'src/entities/embedded/address.entity';
import { User } from 'src/entities/user/user.entity';
import { Gender } from 'src/types/gender/gender.type';
import { Rank } from 'src/types/rank/rank.type';
import { Role } from 'src/types/role/role.type';

export const getMockUsers = (church: Church, cell?: Cell): User[] => {
  return [
    User.of(
      church,
      cell ?? null,
      'userA',
      1,
      Role.LEADER,
      Rank.NONE,
      Gender.NONE,
      '1996-11-27',
      new Address('12345', '서울'),
      '010-1234-5678',
      false,
    ),
    User.of(
      church,
      cell ?? null,
      'userB',
      1,
      Role.LEADER,
      Rank.NONE,
      Gender.NONE,
      '1996-11-27',
      new Address('12345', '서울'),
      '010-1234-5678',
      false,
    ),
    User.of(
      church,
      cell ?? null,
      'userC',
      1,
      Role.MEMBER,
      Rank.NONE,
      Gender.NONE,
      '1996-11-27',
      new Address('12345', '서울'),
      '010-1234-5678',
      false,
    ),
    User.of(
      church,
      cell ?? null,
      'userD',
      1,
      Role.MEMBER,
      Rank.NONE,
      Gender.NONE,
      '1996-11-27',
      new Address('12345', '서울'),
      '010-1234-5678',
      false,
    ),
    User.of(
      church,
      cell ?? null,
      'userE',
      1,
      Role.NEWBIE,
      Rank.NONE,
      Gender.NONE,
      '1996-11-27',
      new Address('12345', '서울'),
      '010-1234-5678',
      false,
    ),
  ];
};

export const mockCreateNewbieRequest: CreateUserRequest = plainToInstance(CreateUserRequest, {
  name: 'userA',
  age: 27,
  role: '새신자',
  rank: '선택안함',
  gender: '남성',
  birth: '1996-11-27',
  zipCode: null,
  address: null,
  contact: '010-1234-5678',
  churchId: 1,
});

export const mockCreateUserRequest: CreateUserRequest = plainToInstance(CreateUserRequest, {
  name: 'userA',
  age: 27,
  role: '새신자',
  rank: '선택안함',
  gender: '남성',
  birth: '1996-11-27',
  zipCode: null,
  address: null,
  contact: '010-1234-5678',
  churchId: 1,
  cellId: 1,
});

export const getMockUser = (
  name: string,
  role: Role,
  rank: Rank,
  gender: Gender,
  cell: Cell | null,
  password?: string,
): User => {
  return plainToInstance(User, {
    name,
    age: 27,
    role,
    rank,
    gender,
    image: 'image',
    birth: '1996-11-27',
    address: new Address('12345', '서울시 구로구'),
    contact: '010-1234-5678',
    churchId: 1,
    cell,
    isLongAbsenced: false,
    password,
  });
};
