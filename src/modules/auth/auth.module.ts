import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { V1AuthModule } from './v1/v1-auth.module';

@Module({
  imports: [
    V1AuthModule,
    RouterModule.register([
      {
        path: 'api/v1',
        module: V1AuthModule,
      },
    ]),
  ],
})
export class AuthModule {}
