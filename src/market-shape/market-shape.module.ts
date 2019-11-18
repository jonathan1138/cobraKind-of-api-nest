import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../user-auth/auth.module';
import { MarketShapeController } from './market-shape.controller';
import { MarketShapeService } from './market-shape.service';
import { MarketShapeRepository } from './market-shape.repository';
import { MarketRepository } from '../market/market.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MarketShapeRepository, MarketRepository]), AuthModule],
  controllers: [MarketShapeController],
  providers: [MarketShapeService],
})
export class MarketShapeModule {}
