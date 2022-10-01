import { DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const entitiesPath = path.join(__dirname + './../../entities/*/*.entity{.ts,.js}');

export function getTypeormModule(): DynamicModule {
  return TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      type: 'postgres',
      host: configService.get('DB_HOST'),
      port: configService.get('DB_PORT') || 5432,
      database: configService.get('DB_DATABASE'),
      username: configService.get('DB_USERNAME'),
      password: configService.get('DB_PASSWORD'),
      synchronize: true,
      entities: [entitiesPath],
      logging: process.env.NODE_ENV === 'prod' ? ['error'] : 'all',
      namingStrategy: new SnakeNamingStrategy(),
      // connecton pool option
      // https://github.com/typeorm/typeorm/issues/3388
      // https://node-postgres.com/api/pool
      extra: {
        max: 5,
      },
    }),
  });
}
