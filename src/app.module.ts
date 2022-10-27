import { DynamicModule, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { getConfigModule } from './config/config.module';
import { getTypeormModule } from './config/typeorm/typeorm.config';
import { AuthorizationGuard } from './core/guard/authorization.guard';
import { AuthModule } from './modules/auth/auth.module';
import { CellModule } from './modules/cell/cell.module';
import { ChurchModule } from './modules/church/church.module';
import { CoreModule } from './modules/core/core.module';
import { UserModule } from './modules/user/user.module';

const configModule: DynamicModule[] = [getConfigModule(), getTypeormModule()];
const applicationModule = [AuthModule, UserModule, ChurchModule, CellModule];

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
