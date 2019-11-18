import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../user-auth/auth.module';
import { S3UploadService } from '../shared/services/awsS3Upload.service';
import { FileReaderService } from 'src/shared/services/csvFileReaders/fileReader.service';
import { GenreRepository } from '../exchange-genre/genre.repository';
import { ExchangeRepository } from 'src/exchange/exchange.repository';
import { MarketRepository } from 'src/market/market.repository';
import { CategoryRepository } from 'src/category/category.repository';
import { PartController } from './part.controller';
import { PartService } from './part.service';
import { PartRepository } from './part.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PartRepository, CategoryRepository, MarketRepository, GenreRepository, ExchangeRepository]), AuthModule],
  controllers: [PartController],
  providers: [PartService, S3UploadService, FileReaderService],
})
export class PartModule {}
