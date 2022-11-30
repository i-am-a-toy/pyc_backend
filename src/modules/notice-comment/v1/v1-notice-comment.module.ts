import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticeComment } from 'src/entities/notice-comment/notice-comment.entity';
import { NoticeCommentController } from './controllers/notice-comment.controller';
import { NoticeCommentService, NoticeCommentServiceKey } from './serviecs/notice-comment.service';

@Module({
  imports: [TypeOrmModule.forFeature([NoticeComment])],
  providers: [
    {
      provide: NoticeCommentServiceKey,
      useClass: NoticeCommentService,
    },
  ],
  controllers: [NoticeCommentController],
})
export class V1NoticeCommentModule {}
