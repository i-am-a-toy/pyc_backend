import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { V1ChurchModule } from './v1/v1-church.module';

@Module({
  imports: [
    V1ChurchModule,
    RouterModule.register([
      {
        path: '/api/v1',
        module: V1ChurchModule,
      },
    ]),
  ],
})
export class ChurchModule {}
