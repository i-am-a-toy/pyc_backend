import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cell } from './cell.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cell])],
  exports: [TypeOrmModule],
})
export class CellEntityModuel {}
