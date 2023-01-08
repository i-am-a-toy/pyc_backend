import { Module } from '@nestjs/common';
import { ChurchRepository } from './church.repository';

@Module({
  providers: [ChurchRepository],
  exports: [ChurchRepository],
})
export class ChurchRepositoryModule {}
