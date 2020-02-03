import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../user-auth/auth.module';
import { S3UploadService } from '../shared/services/s3Uploader/awsS3Upload.service';
import { GenreRepository } from '../exchange-genre/genre.repository';
import { ExchangeRepository } from 'src/market-exchange/exchange.repository';
import { MarketRepository } from 'src/market/market.repository';
import { CategoryRepository } from 'src/category/category.repository';
import { PartController } from './part.controller';
import { PartService } from './part.service';
import { PartRepository } from './part.repository';
import { TagRepository } from 'src/market-tag/tag.repository';
import { SubItemRepository } from 'src/exchange-subs/exchange-sub-item/sub-item.repository';
import { ManufacturerRepository } from '../manufacturer/manufacturer.repository';
import { CreatedYearRepository } from '../created-year/year.repository';
import { UserRepository } from 'src/user/user.repository';
import { UserIp } from 'src/user-ip-for-views/user-ip.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PartRepository, CategoryRepository, MarketRepository,
    GenreRepository, UserRepository, ExchangeRepository, TagRepository, SubItemRepository,
    CreatedYearRepository, ManufacturerRepository, UserIp]), AuthModule],
  controllers: [PartController],
  providers: [PartService, S3UploadService],
})
export class PartModule {}
