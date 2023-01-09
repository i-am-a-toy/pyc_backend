import { Injectable } from '@nestjs/common';
import { GenericTypeOrmRepository } from 'src/core/database/typeorm/generic-typeorm.repository';
import { TransactionManager } from 'src/core/database/typeorm/transaction.manager';
import { EntityTarget } from 'typeorm';
import { IGroupRepository } from './group-repository.interface';
import { Group } from './group.entity';

@Injectable()
export class GroupRepository extends GenericTypeOrmRepository<Group> implements IGroupRepository {
  constructor(txManager: TransactionManager) {
    super(txManager);
  }

  findByName(churchId: number, name: string): Promise<Group | null> {
    return this.getRepository().findOneBy({ churchId, name: name });
  }

  findAll(churchId: number, offset: number, limit: number): Promise<[Group[], number]> {
    return this.getRepository().findAndCount({ where: { churchId }, skip: offset, take: limit });
  }

  findById(id: number): Promise<Group | null> {
    return this.getRepository().findOne({ where: { id }, relations: ['leader'] });
  }

  getName(): EntityTarget<Group> {
    return Group.name;
  }
}
