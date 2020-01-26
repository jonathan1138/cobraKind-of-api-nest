import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../user-auth/auth.module';
import { S3UploadService } from '../shared/services/s3Uploader/awsS3Upload.service';
import { GenreRepository } from '../exchange-genre/genre.repository';
import { ExchangeRepository } from 'src/market-exchange/exchange.repository';
import { MarketRepository } from 'src/market/market.repository';
import { CategoryRepository } from 'src/category/category.repository';
import { ManufacturerController } from './manufacturer.controller';
import { ManufacturerService } from './manufacturer.service';
import { ManufacturerRepository } from './manufacturer.repository';

@Module({
  imports: [TypeOrmModule.forFeature(
    [ManufacturerRepository, CategoryRepository, MarketRepository, GenreRepository, ExchangeRepository]), AuthModule],
  controllers: [ManufacturerController],
  providers: [ManufacturerService, S3UploadService],
})
export class ManufacturerModule {}
