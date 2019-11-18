import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../user-auth/auth.module';
import { ExchangeRepository } from '../exchange/exchange.repository';
import { UserRepository } from '../user/user.repository';
import { PriceRatingInfoController } from './price-rating-info.controller';
import { PriceRatingInfoService } from './price-rating-info.service';
import { PriceRatingInfoRepository } from './price-rating-info.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PriceRatingInfoRepository, ExchangeRepository, UserRepository]), AuthModule],
  controllers: [PriceRatingInfoController],
  providers: [PriceRatingInfoService],
})
export class PriceRatingInfoModule {}
