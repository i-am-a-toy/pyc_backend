import * as dotenv from 'dotenv';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

dotenv.config({
  path:
    process.env.NODE_ENV === 'prod'
      ? path.join(__dirname, '../env/.env.production')
      : path.join(__dirname, '../env/.env.development'),
});

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? +process.env.DB_PORT : 5432,
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  logging: process.env.NODE_ENV === 'prod' ? ['error'] : 'all',
  namingStrategy: new SnakeNamingStrategy(),
  migrations: [path.join(__dirname, '../../migrations/*.ts')],
  migrationsTableName: 'migrations',
});
