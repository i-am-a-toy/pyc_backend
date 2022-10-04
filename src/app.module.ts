import { DynamicModule, Module } from '@nestjs/common';
import { getConfigModule } from './config/config.module';
import { getTypeormModule } from './config/typeorm/typeorm.config';
import { ChurchModule } from './modules/church/church.module';

const configModule: DynamicModule[] = [getConfigModule(), getTypeormModule()];

@Module({
  imports: [...configModule, ChurchModule],
})
export class AppModule {}
