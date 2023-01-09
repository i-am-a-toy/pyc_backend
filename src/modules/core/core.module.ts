import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from 'src/core/database/typeorm/typeorm.module';
import { TokenModule } from './token/token.module';

const coreModules = [TokenModule, TypeOrmModule];

@Global()
@Module({
  imports: [...coreModules],
  exports: [...coreModules],
})
export class CoreModule {}
