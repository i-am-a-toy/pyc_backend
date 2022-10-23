import { plainToInstance } from 'class-transformer';
import { Church } from 'src/entities/church/church.entity';
import { Family } from 'src/entities/family/family.entity';
import { User } from 'src/entities/user/user.entity';

export const getMockFamily = (church: Church, leader: User, subLeader: User | null, name: string) => {
  return plainToInstance(Family, {
    church,
    leader,
    subLeader,
    name,
  });
};
