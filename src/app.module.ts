import { DynamicModule, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { getConfigModule } from './config/config.module';
import { getTypeormModule } from './config/typeorm/typeorm.config';
import { AuthorizationGuard } from './core/guard/authorization.guard';
import { CoreModule } from './modules/core/core.module';
import { NoticeModule } from './modules/notice/notice.module';

const configModule: DynamicModule[] = [getConfigModule(), getTypeormModule()];
// const applicationModule = [AuthModule, UserModule, ChurchModule, CellModule, NoticeModule];
const applicationModule = [NoticeModule];

@Module({
  imports: [...configModule, CoreModule, ...applicationModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthorizationGuard,
    },
  ],
})
export class AppModule {}
