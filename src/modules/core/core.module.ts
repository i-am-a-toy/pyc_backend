import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenModule } from './token/token.module';

const coreModules = [TokenModule, TypeOrmModule];

@Global()
@Module({
  imports: [...coreModules],
  exports: [...coreModules],
})
export class CoreModule {}
