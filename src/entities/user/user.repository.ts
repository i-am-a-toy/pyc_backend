import { Injectable } from '@nestjs/common';
import { GenericTypeOrmRepository } from 'src/core/database/typeorm/generic-typeorm.repository';
import { TransactionManager } from 'src/core/database/typeorm/transaction.manager';
import { EntityTarget } from 'typeorm';
import { IUserRepository } from './user-repository.interface';
import { User } from './user.entity';

@Injectable()
export class UserRepository extends GenericTypeOrmRepository<User> implements IUserRepository {
  constructor(txManager: TransactionManager) {
    super(txManager);
  }

  getName(): EntityTarget<User> {
    return User.name;
  }
}
