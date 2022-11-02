import { DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

export function getJwtModuel(): DynamicModule {
  return JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      secret: configService.get('JWT_SECRET'),
      /**
       * expiresIn는 https://github.com/vercel/ms 기준으로 정의된다.
       */
      signOptions: {
        issuer: 'pyc',
        expiresIn: `${configService.get('JWT_EXPIRES_IN')}`,
      },
    }),
  });
}
