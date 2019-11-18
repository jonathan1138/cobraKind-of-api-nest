import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as config from 'config';

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: process.env.TYPEORM_TYPE || config.get('DB.TYPE'),
    host: process.env.TYPEORM_HOST || config.get('DB.HOST'),
    port: process.env.TYPEORM_PORT || config.get('DB.PORT'),
    username: process.env.TYPEORM_USERNAME || config.get('DB.USERNAME'),
    password: process.env.TYPEORM_PASSWORD || config.get('DB.PASSWORD'),
    database: process.env.TYPEORM_DATABASE || config.get('DB.DATABASE'),
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    synchronize: process.env.TYPEORM_SYNC || config.get('DB.SYNCHRONIZE'),
    uuidExtension: 'pgcrypto',
};
