import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { V1UserModule } from './v1/v1-user.module';

@Module({
  imports: [
    V1UserModule,
    RouterModule.register([
      {
        path: '/api/v1',
        module: V1UserModule,
      },
    ]),
  ],
})
export class UserModule {}
