import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notice } from './notice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notice])],
  exports: [TypeOrmModule],
})
export class NoticeEntityModule {}
