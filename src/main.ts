import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import * as config from 'config';
import * as requestIp from 'request-ip';

async function bootstrap() {
  const serverConfigPort = config.get('SERVER.PORT');
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  // app.use(requestIp.mw());

  if (process.env.NODE_ENV === 'development') {
    app.enableCors();
  }

  const port = process.env.PORT || serverConfigPort;
  await app.listen(port);
  logger.log(`The Cobra is listening on port ${port} in ${process.env.NODE_ENV} mode`);
}
bootstrap();
