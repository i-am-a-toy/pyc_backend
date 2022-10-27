import { Global, Module } from '@nestjs/common';
import { TokenModule } from './token/token.module';

const coreModules = [TokenModule];

@Global()
@Module({
  imports: [...coreModules],
  exports: [...coreModules],
})
export class CoreModule {}
