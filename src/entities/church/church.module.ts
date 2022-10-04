import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Church } from './church.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Church])],
  exports: [TypeOrmModule],
})
export class ChurchEntityModule {}
