import { Module } from '@nestjs/common';
import { NoticeCommentController } from './controllers/notice-comment.controller';
import { NoticeCommentService, NoticeCommentServiceKey } from './serviecs/notice-comment.service';

@Module({
  providers: [
    {
      provide: NoticeCommentServiceKey,
      useClass: NoticeCommentService,
    },
  ],
  controllers: [NoticeCommentController],
})
export class V1NoticeCommentModule {}
