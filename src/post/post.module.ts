import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PostRepository } from './post.repository';
import { S3UploadService } from 'src/shared/services/s3Uploader/awsS3Upload.service';
import { UserRepository } from '../user/user.repository';
import { ExchangeRepository } from 'src/market-exchange/exchange.repository';
import { AuthModule } from 'src/user-auth/auth.module';
import { UserIp } from '../user-ip-for-views/user-ip.entity';
import { PriceRatingInfoRepository } from '../exchange-price-rating-info/price-rating-info.repository';
import { SubItemRepository } from 'src/exchange-subs/exchange-sub-item/sub-item.repository';
import { MarketRepository } from 'src/market/market.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PostRepository, UserRepository, ExchangeRepository,
    SubItemRepository, MarketRepository, UserIp, PriceRatingInfoRepository]), AuthModule],
  controllers: [PostController],
  providers: [PostService, S3UploadService],
})
export class PostModule {}
