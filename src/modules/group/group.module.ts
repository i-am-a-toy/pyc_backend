import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { V1GroupModule } from './v1/v1-group.module';

@Module({
  imports: [
    V1GroupModule,
    RouterModule.register([
      {
        path: '/api/v1',
        module: V1GroupModule,
      },
    ]),
  ],
})
export class GroupModule {}
