import { DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';

const devPath = path.join(__dirname, './env/.env.development');
const prodPath = path.join(__dirname, './env/.env.production');

export function getConfigModule(): DynamicModule {
  return ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: process.env.NODE_ENV === 'prod' ? prodPath : devPath,
  });
}
