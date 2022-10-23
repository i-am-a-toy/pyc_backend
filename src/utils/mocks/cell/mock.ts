import { plainToInstance } from 'class-transformer';
import { Cell } from 'src/entities/cell/cell.entity';
import { Family } from 'src/entities/family/family.entity';
import { User } from 'src/entities/user/user.entity';

export const getMockCell = (name: string, leader: User, family: Family | null): Cell => {
  return plainToInstance(Cell, {
    churchId: 1,
    family,
    leader,
    name,
  });
};
