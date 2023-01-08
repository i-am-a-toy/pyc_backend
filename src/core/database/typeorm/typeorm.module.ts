import { Module } from '@nestjs/common';
import { TransactionManager } from './transaction.manager';

@Module({
  providers: [TransactionManager],
  exports: [TransactionManager],
})
export class TypeOrmModule {}
