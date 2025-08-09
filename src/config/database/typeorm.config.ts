import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function createTypeOrmOptions(): TypeOrmModuleOptions {
  const isSsl = process.env.DB_SSL === 'true';
  return {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: isSsl ? { rejectUnauthorized: false } : false,
    autoLoadEntities: true,
    synchronize: process.env.TYPEORM_SYNC === 'true',
    logging: process.env.TYPEORM_LOGGING === 'true',
  } as TypeOrmModuleOptions;
}
