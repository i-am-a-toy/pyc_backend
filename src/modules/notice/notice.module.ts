import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { V1NoticeModule } from './v1/v1-notice.module';

@Module({
  imports: [
    V1NoticeModule,
    RouterModule.register([
      {
        path: '/api/v1',
        module: V1NoticeModule,
      },
    ]),
  ],
})
export class NoticeModule {}
