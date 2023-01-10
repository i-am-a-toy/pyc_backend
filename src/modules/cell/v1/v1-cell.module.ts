import { Module } from '@nestjs/common';
import { CellRepositoryModule } from 'src/entities/cell/cell-repository.module';

@Module({
  imports: [CellRepositoryModule],
})
export class V1CellModule {}
