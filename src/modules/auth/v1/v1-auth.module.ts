import { ClassProvider, Module } from '@nestjs/common';
import { UserEntityModule } from 'src/entities/user/user-entity.module';
import { TokenModule } from 'src/modules/core/token/token.module';
import { AuthController } from './controllers/auth.controller';
import { AuthServiceKey } from './interfaces/auth-service.interface';
import { AuthService } from './services/auth.service';

const authService: ClassProvider = {
  provide: AuthServiceKey,
  useClass: AuthService,
};

@Module({
  imports: [TokenModule, UserEntityModule],
  controllers: [AuthController],
  providers: [authService],
})
export class V1AuthModule {}
