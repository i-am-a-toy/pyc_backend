import { Module } from '@nestjs/common';
import { UserEntityModule } from 'src/entities/user/user-entity.module';
import { UserController } from './controllers/user-controller';

@Module({
  imports: [UserEntityModule],
  controllers: [UserController],
  providers: [],
})
export class V1UserModule {}
