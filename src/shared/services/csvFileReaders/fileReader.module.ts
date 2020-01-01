import { Module } from '@nestjs/common';
import { FileReaderService } from './fileReader.service';
import { CategoryService } from '../../../category/category.service';
import { MarketService } from 'src/market/market.service';
import { FileReaderController } from './fileReader.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketRepository } from 'src/market/market.repository';
import { CategoryRepository } from 'src/category/category.repository';
import { S3UploadService } from '../s3Uploader/awsS3Upload.service';
import { TagRepository } from 'src/market-tag/tag.repository';
import { UserRepository } from '../../../user/user.repository';
import { UserIp } from '../../../user-ip-for-views/userIp.entity';
import { ProfileRepository } from '../../../user-profile/profile.repository';
import { ProfileService } from '../../../user-profile/profile.service';
import { ExchangeRepository } from '../../../exchange/exchange.repository';
import { AuthModule } from '../../../user-auth/auth.module';
import { TagService } from 'src/market-tag/tag.service';
import { ExchangeService } from 'src/exchange/exchange.service';
import { GenreRepository } from '../../../exchange-genre/genre.repository';
import { SubVariationRepository } from '../../../exchange-sub-variation/sub-variation.repository';

@Module({
    imports: [TypeOrmModule.forFeature([MarketRepository, CategoryRepository, TagRepository,
        UserRepository, UserIp, ProfileRepository, ExchangeRepository, GenreRepository, SubVariationRepository]), AuthModule],
    controllers: [FileReaderController],
    providers: [FileReaderService, CategoryService, MarketService, S3UploadService, ProfileService, TagService, ExchangeService],
})
export class FileReaderModule {}
