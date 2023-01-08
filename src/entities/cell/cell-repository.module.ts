import { Module } from '@nestjs/common';
import { CellRepository } from './cell.repository';

@Module({
  providers: [CellRepository],
  exports: [CellRepository],
})
export class CellRepositoryModule {}
