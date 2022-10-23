import { Module } from '@nestjs/common';
import { UserEntityModule } from 'src/entities/user/user-entity.module';
import { UserController } from './controllers/user-controller';
import { UserService } from './services/UserService';

@Module({
  imports: [UserEntityModule],
  controllers: [UserController],
  providers: [
    {
      provide: 'userService',
      useClass: UserService,
    },
  ],
})
export class V1UserModule {}
