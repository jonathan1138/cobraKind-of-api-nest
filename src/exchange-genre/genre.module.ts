import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../user-auth/auth.module';
import { S3UploadService } from '../shared/services/awsS3Upload.service';
import { FileReaderService } from 'src/shared/services/csvFileReaders/fileReader.service';
import { GenreController } from './genre.controller';
import { GenreService } from './genre.service';
import { GenreRepository } from './genre.repository';
import { ExchangeRepository } from 'src/exchange/exchange.repository';
import { MarketRepository } from 'src/market/market.repository';
import { CategoryRepository } from 'src/category/category.repository';
import { PartRepository } from 'src/market-part/part.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryRepository, MarketRepository, GenreRepository, ExchangeRepository, PartRepository]), AuthModule],
  controllers: [GenreController],
  providers: [GenreService, S3UploadService, FileReaderService],
})
export class GenreModule {}
