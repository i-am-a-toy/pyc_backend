import { Module } from '@nestjs/common';
import { CellEntityModuel } from 'src/entities/cell/cell-entity.module';

@Module({
  imports: [CellEntityModuel],
})
export class V1CellModule {}
