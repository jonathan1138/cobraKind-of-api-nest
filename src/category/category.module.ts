import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryRepository } from './category.repository';
import { AuthModule } from '../user-auth/auth.module';
import { S3UploadService } from '../shared/services/awsS3Upload.service';
import { FileReaderService } from '../shared/services/csvFileReaders/fileReader.service';
import { MarketRepository } from '../market/market.repository';
import { ExchangeRepository } from '../exchange/exchange.repository';
import { GenreRepository } from 'src/exchange-genre/genre.repository';
import { PartRepository } from '../market-part/part.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryRepository, MarketRepository, ExchangeRepository, GenreRepository, PartRepository]), AuthModule ],
  controllers: [CategoryController],
  providers: [CategoryService, S3UploadService, FileReaderService],
})
export class CategoryModule {}
