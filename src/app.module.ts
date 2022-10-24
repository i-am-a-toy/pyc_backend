import { DynamicModule, Module } from '@nestjs/common';
import { getConfigModule } from './config/config.module';
import { getTypeormModule } from './config/typeorm/typeorm.config';
import { CellModule } from './modules/cell/cell.module';
import { ChurchModule } from './modules/church/church.module';
import { UserModule } from './modules/user/user.module';

const configModule: DynamicModule[] = [getConfigModule(), getTypeormModule()];

@Module({
  imports: [...configModule, ChurchModule, UserModule, CellModule],
})
export class AppModule {}
