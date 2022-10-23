import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { V1CellModule } from './v1/v1-cell.module';

@Module({
  imports: [
    V1CellModule,
    RouterModule.register([
      {
        path: '/api/v1',
        module: V1CellModule,
      },
    ]),
  ],
})
export class CellModule {}
