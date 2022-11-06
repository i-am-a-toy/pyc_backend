import { ClassProvider, Module } from '@nestjs/common';
import { NoticeEntityModule } from 'src/entities/notice/notice-entity.module';
import { NoticeController } from './controllers/notice.controller';
import { NoticeService, NoticeServiceKey } from './services/notice.service';

const noticeService: ClassProvider = {
  provide: NoticeServiceKey,
  useClass: NoticeService,
};

@Module({
  imports: [NoticeEntityModule],
  controllers: [NoticeController],
  providers: [noticeService],
})
export class V1NoticeModule {}
