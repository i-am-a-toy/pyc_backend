import { plainToInstance } from 'class-transformer';
import { Church } from 'src/entities/church/church.entity';
import { Group } from 'src/entities/group/group.entity';
import { User } from 'src/entities/user/user.entity';

export const getMockFamily = (church: Church, leader: User, subLeader: User | null, name: string) => {
  return plainToInstance(Group, {
    church,
    leader,
    subLeader,
    name,
  });
};
