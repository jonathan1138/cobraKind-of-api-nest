import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketRepository } from '../market/market.repository';
import { AuthModule } from '../user-auth/auth.module';
import { S3UploadService } from '../shared/services/awsS3Upload.service';
import { FileReaderService } from 'src/shared/services/csvFileReaders/fileReader.service';
import { ExchangeService } from './exchange.service';
import { ExchangeController } from './exchange.controller';
import { GenreRepository } from 'src/exchange-genre/genre.repository';
import { ExchangeRepository } from './exchange.repository';
import { CategoryRepository } from 'src/category/category.repository';
import { PartRepository } from 'src/market-part/part.repository';
import { SubVariationRepository } from '../exchange-sub-variation/sub-variation.repository';
import { UserRepository } from '../user/user.repository';
import { UserIp } from 'src/user-ip-for-views/userIp.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryRepository, ExchangeRepository, MarketRepository,
    GenreRepository, PartRepository, SubVariationRepository, UserRepository, UserIp]), AuthModule],
  controllers: [ExchangeController],
  providers: [ExchangeService, S3UploadService, FileReaderService],
})
export class ExchangeModule {}
