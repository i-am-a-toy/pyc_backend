import { plainToInstance } from 'class-transformer';
import { Cell } from 'src/entities/cell/cell.entity';
import { Group } from 'src/entities/group/group.entity';
import { User } from 'src/entities/user/user.entity';

export const getMockCell = (name: string, leader: User, family: Group | null): Cell => {
  return plainToInstance(Cell, {
    churchId: 1,
    family,
    leader,
    name,
  });
};
