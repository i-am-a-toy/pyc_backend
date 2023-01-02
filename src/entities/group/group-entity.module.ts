import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Group])],
  exports: [TypeOrmModule],
})
export class GroupEntityModule {}
