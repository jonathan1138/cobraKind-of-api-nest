import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../user-auth/auth.module';
import { S3UploadService } from '../shared/services/awsS3Upload.service';
import { FileReaderService } from 'src/shared/services/csvFileReaders/fileReader.service';
import { GenreRepository } from '../exchange-genre/genre.repository';
import { ExchangeRepository } from 'src/exchange/exchange.repository';
import { MarketRepository } from 'src/market/market.repository';
import { CategoryRepository } from 'src/category/category.repository';
import { ManufacturerController } from './manufacturer.controller';
import { ManufacturerService } from './manufacturer.service';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryRepository, MarketRepository, GenreRepository, ExchangeRepository]), AuthModule],
  controllers: [ManufacturerController],
  providers: [ManufacturerService, S3UploadService, FileReaderService],
})
export class ManufacturerModule {}
