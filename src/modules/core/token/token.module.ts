import { ClassProvider, Module } from '@nestjs/common';
import { getJwtModuel } from 'src/config/jwt/jwt.config';
import { RefreshTokenEntityModule } from 'src/entities/refresh-token/refresh-token-entity.module';
import { TokenServiceKey } from './interfaces/token-service.interface';
import { TokenService } from './services/token.service';

const tokenService: ClassProvider = {
  provide: TokenServiceKey,
  useClass: TokenService,
};

@Module({
  imports: [getJwtModuel(), RefreshTokenEntityModule],
  exports: [tokenService],
  providers: [tokenService],
})
export class TokenModule {}
