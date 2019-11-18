import { Module } from '@nestjs/common';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketRepository } from './market.repository';
import { AuthModule } from '../user-auth/auth.module';
import { S3UploadService } from '../shared/services/awsS3Upload.service';
import { CategoryRepository } from '../category/category.repository';
import { TagRepository } from '../market-tag/tag.repository';
import { FileReaderService } from 'src/shared/services/csvFileReaders/fileReader.service';
import { MarketShapeRepository } from '../market-shape/market-shape.repository';
import { ExchangeRepository } from '../exchange/exchange.repository';
import { GenreRepository } from '../exchange-genre/genre.repository';
import { PartRepository } from 'src/market-part/part.repository';
import { UserRepository } from '../user/user.repository';
import { UserIp } from 'src/user-ip-for-views/userIp.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MarketRepository, CategoryRepository, TagRepository,
    MarketShapeRepository, ExchangeRepository, GenreRepository, PartRepository, UserRepository, UserIp]), AuthModule],
  controllers: [MarketController],
  providers: [MarketService, S3UploadService, FileReaderService],
})
export class MarketModule {}
