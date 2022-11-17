import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticeComment } from './notice-comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NoticeComment])],
  exports: [TypeOrmModule],
})
export class NoticeCommentEntityModule {}
