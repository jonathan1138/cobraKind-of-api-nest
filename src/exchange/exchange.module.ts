import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketRepository } from '../market/market.repository';
import { AuthModule } from '../user-auth/auth.module';
import { S3UploadService } from '../shared/services/s3Uploader/awsS3Upload.service';
import { ExchangeService } from './exchange.service';
import { ExchangeController } from './exchange.controller';
import { GenreRepository } from 'src/exchange-genre/genre.repository';
import { ExchangeRepository } from './exchange.repository';
import { CategoryRepository } from 'src/category/category.repository';
import { PartRepository } from 'src/market-part/part.repository';
import { SubVariationRepository } from '../exchange-sub-variation/sub-variation.repository';
import { UserRepository } from '../user/user.repository';
import { UserIp } from 'src/user-ip-for-views/userIp.entity';
import { ProfileService } from '../user-profile/profile.service';
import { ProfileRepository } from '../user-profile/profile.repository';
import { TagRepository } from 'src/market-tag/tag.repository';
import { SubItemRepository } from 'src/exchange-sub-item/sub-item.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryRepository, ExchangeRepository, MarketRepository,
    GenreRepository, PartRepository, SubVariationRepository, UserRepository, UserIp,
    TagRepository, ProfileRepository, SubItemRepository]), AuthModule],
  controllers: [ExchangeController],
  providers: [ExchangeService, S3UploadService, ProfileService],
})
export class ExchangeModule {}
