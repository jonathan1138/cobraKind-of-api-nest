import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeController } from './home.controller';

@Module({
  controllers: [HomeController],
})
export class HomeModule {}
