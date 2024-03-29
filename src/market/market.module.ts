import { Module } from '@nestjs/common';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketRepository } from './market.repository';
import { AuthModule } from '../user-auth/auth.module';
import { S3UploadService } from '../shared/services/s3Uploader/awsS3Upload.service';
import { CategoryRepository } from '../category/category.repository';
import { TagRepository } from '../market-tag/tag.repository';
import { ExchangeRepository } from '../market-exchange/exchange.repository';
import { PartRepository } from 'src/market-part/part.repository';
import { UserRepository } from '../user/user.repository';
import { UserIp } from 'src/user-ip-for-views/user-ip.entity';
import { ProfileService } from '../user-profile/profile.service';
import { ProfileRepository } from 'src/user-profile/profile.repository';
import { GenreRepository } from '../exchange-genre/genre.repository';
import { SubItemRepository } from '../exchange-subs/exchange-sub-item/sub-item.repository';
@Module({
  imports: [TypeOrmModule.forFeature([MarketRepository, CategoryRepository, TagRepository, GenreRepository,
    ExchangeRepository, PartRepository, UserRepository, SubItemRepository,
    ProfileRepository, UserIp]), AuthModule],
  controllers: [MarketController],
  providers: [MarketService, S3UploadService, ProfileService],
})
export class MarketModule {}
