import { Injectable } from '@nestjs/common';
import { GenericTypeOrmRepository } from 'src/core/database/typeorm/generic-typeorm.repository';
import { TransactionManager } from 'src/core/database/typeorm/transaction.manager';
import { EntityTarget } from 'typeorm';
import { IChurchRepository } from './church-repository.interface';
import { Church } from './church.entity';

@Injectable()
export class ChurchRepository extends GenericTypeOrmRepository<Church> implements IChurchRepository {
  constructor(txManager: TransactionManager) {
    super(txManager);
  }

  getName(): EntityTarget<Church> {
    return Church.name;
  }
}
