import { Module } from '@nestjs/common';
import { NoticeCommentController } from './controllers/notice-comment.controller';

@Module({
  controllers: [NoticeCommentController],
})
export class V1NoticeCommentModule {}
