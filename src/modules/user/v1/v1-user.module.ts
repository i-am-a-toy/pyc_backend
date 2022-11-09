import { ClassProvider, Module } from '@nestjs/common';
import { UserEntityModule } from 'src/entities/user/user-entity.module';
import { UserController } from './controllers/user-controller';
import { UserServicekey } from './interfaces/user-service.interface';
import { UserService } from './services/user.service';

const userService: ClassProvider = {
  provide: UserServicekey,
  useClass: UserService,
};

@Module({
  imports: [UserEntityModule],
  controllers: [UserController],
  providers: [userService],
})
export class V1UserModule {}
