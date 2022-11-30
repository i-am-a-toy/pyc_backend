import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { V1NoticeCommentModule } from './v1/v1-notice-comment.module';

@Module({
  imports: [
    NoticeCommentModule,
    RouterModule.register([
      {
        module: V1NoticeCommentModule,
        path: '/api/v1',
      },
    ]),
  ],
})
export class NoticeCommentModule {}
