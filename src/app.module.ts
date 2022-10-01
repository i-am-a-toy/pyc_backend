import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getConfigModule } from './config/config.module';
import { getTypeormModule } from './config/typeorm/typeorm.config';

@Module({
  imports: [getConfigModule(), getTypeormModule()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
