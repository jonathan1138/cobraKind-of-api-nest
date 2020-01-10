import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../user-auth/auth.module';
import { S3UploadService } from '../shared/services/s3Uploader/awsS3Upload.service';
import { GenreRepository } from '../exchange-genre/genre.repository';
import { ExchangeRepository } from 'src/exchange/exchange.repository';
import { MarketRepository } from 'src/market/market.repository';
import { CategoryRepository } from 'src/category/category.repository';
import { YearCreatedController } from './year.controller';
import { YearCreatedService } from './year.service';
import { YearCreatedRepository } from './year.repository';

@Module({
  imports: [TypeOrmModule.forFeature([YearCreatedRepository, CategoryRepository, MarketRepository, GenreRepository, ExchangeRepository]), AuthModule],
  controllers: [YearCreatedController],
  providers: [YearCreatedService, S3UploadService],
})
export class YearCreatedModule {}
