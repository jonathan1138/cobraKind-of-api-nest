import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../user-auth/auth.module';
import { ExchangeRepository } from '../market-exchange/exchange.repository';
import { UserRepository } from '../user/user.repository';
import { ListingRatingController } from './listing-rating.controller';
import { ListingRatingService } from './listing-rating.service';
import { ListingRatingRepository } from './listing-rating.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ListingRatingRepository, ExchangeRepository, UserRepository]), AuthModule],
  controllers: [ListingRatingController],
  providers: [ListingRatingService],
})
export class ListingRatingModule {}
