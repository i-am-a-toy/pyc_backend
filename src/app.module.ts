import { DynamicModule, Logger, Module } from '@nestjs/common';
import { MiddlewareConsumer, NestModule, OnApplicationShutdown } from '@nestjs/common/interfaces';
import { APP_GUARD } from '@nestjs/core';
import { destroyNamespace, getNamespace } from 'cls-hooked';
import { DataSource } from 'typeorm';
import { getConfigModule } from './config/config.module';
import { getTypeormModule } from './config/typeorm/typeorm.config';
import { AuthorizationGuard } from './core/guard/authorization.guard';
import { PYC_NAMESPACE, TransactionMiddleware } from './core/database/typeorm/transaction.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { CellModule } from './modules/cell/cell.module';
import { ChurchModule } from './modules/church/church.module';
import { CoreModule } from './modules/core/core.module';
import { NoticeCommentModule } from './modules/notice-comment/notice-comment.module';
import { NoticeModule } from './modules/notice/notice.module';
import { UserModule } from './modules/user/user.module';

const configModule: DynamicModule[] = [getConfigModule(), getTypeormModule()];
const applicationModule = [
  AuthModule,
  UserModule,
  ChurchModule,
  CellModule,
  NoticeModule,
  NoticeCommentModule,
  CalendarModule,
];

@Module({
  imports: [...configModule, CoreModule, ...applicationModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthorizationGuard,
    },
  ],
})
export class AppModule implements NestModule, OnApplicationShutdown {
  private readonly logger: Logger = new Logger(AppModule.name);
  constructor(private readonly dataSource: DataSource) {}

  /**
   * for NestJS Server Middleware
   *
   * @description NestJS Application에서 사용할 미들웨어를 정의한다.
   * 현재 사용중인 미들웨어 목록은 {@link TransactionMiddleware} 이다.
   */
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TransactionMiddleware).forRoutes('*');
  }

  /**
   * for NestJS Server Graceful ShutDown
   *
   * @description NestJS Application이 종료가 되었을 때 현재 사용하고 있는 리소스를 종료시켜야 한다.
   * 현재 사용중인 리소스 목록은 NameSpace, PG있다.
   */
  async onApplicationShutdown(signal: string): Promise<void> {
    this.logger.log(`Start Shut Down Graceful with ${signal}`);
    await Promise.resolve().then(async () => {
      this.logger.log('Try Resources Close...');

      // namespace
      if (getNamespace(PYC_NAMESPACE)) {
        destroyNamespace(PYC_NAMESPACE);
        this.logger.log('Destroyed NameSpace :)');
      }

      // database
      if (this.dataSource.isInitialized) {
        this.dataSource.destroy();
        this.logger.log('Destroyed DataSource :)');
      }
      this.logger.log('Finish Resources Close...');
    });
  }
}
