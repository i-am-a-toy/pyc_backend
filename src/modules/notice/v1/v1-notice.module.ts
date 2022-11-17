import { ClassProvider, Module } from '@nestjs/common';
import { NoticeCommentEntityModule } from 'src/entities/notice-comment/notice-comment-entity.module';
import { NoticeEntityModule } from 'src/entities/notice/notice-entity.module';
import { NoticeCommentController } from './controllers/notice-comment.controller';
import { NoticeController } from './controllers/notice.controller';
import { NoticeCommentSerivce, NoticeCommentServiceKey } from './services/notice-comment.service';
import { NoticeService, NoticeServiceKey } from './services/notice.service';

const noticeService: ClassProvider = {
  provide: NoticeServiceKey,
  useClass: NoticeService,
};

const noticeCommentService: ClassProvider = {
  provide: NoticeCommentServiceKey,
  useClass: NoticeCommentSerivce,
};

@Module({
  imports: [NoticeEntityModule, NoticeCommentEntityModule],
  controllers: [NoticeController, NoticeCommentController],
  providers: [noticeService, noticeCommentService],
})
export class V1NoticeModule {}
